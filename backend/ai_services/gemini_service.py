import os
import google.generativeai as genai
from django.conf import settings
import base64
from PIL import Image
import io

class GeminiDescriptionService:
    def __init__(self):
        # Initialize Gemini API with the provided API key from settings
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured in settings")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    def generate_description_from_image(self, image_path, disaster_type=None, location=None):
        """
        Generate emergency description from image using Gemini AI with enhanced confidence calculation
        """
        try:
            # Load and process image
            with open(image_path, 'rb') as image_file:
                image_data = image_file.read()
            
            # Create prompt for emergency description generation
            prompt = self._create_emergency_prompt(disaster_type, location)
            
            # Generate description using Gemini
            response = self.model.generate_content([prompt, image_data])
            
            if response.text:
                # Calculate dynamic confidence based on multiple factors
                confidence = self._calculate_image_confidence(
                    response.text, 
                    image_path, 
                    disaster_type, 
                    location
                )
                
                return {
                    'success': True,
                    'description': response.text.strip(),
                    'confidence': confidence,
                    'source': 'gemini_ai',
                    'disaster_type_suggested': self._extract_disaster_type(response.text),
                    'priority_suggested': self._extract_priority(response.text),
                    'confidence_factors': self._get_confidence_factors(response.text, image_path, disaster_type, location)
                }
            else:
                return self._fallback_response()
                
        except Exception as e:
            print(f"Error in Gemini description generation: {e}")
            return self._fallback_response()
    
    def generate_description_from_text(self, user_description, disaster_type=None, location=None):
        """
        Enhance user description using Gemini AI with enhanced confidence calculation
        """
        try:
            prompt = f"""
            You are an emergency response AI assistant. The user has provided the following emergency description:
            
            "{user_description}"
            
            Disaster Type: {disaster_type or 'Unknown'}
            Location: {location or 'Unknown'}
            
            Please enhance this description to be more detailed, professional, and useful for emergency responders. 
            Include relevant details about:
            - Severity of the situation
            - Immediate risks
            - Number of people affected (if mentioned)
            - Specific location details
            - Urgency level
            
            Keep the enhanced description concise but informative (2-3 sentences max).
            """
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                # Calculate dynamic confidence for text enhancement
                confidence = self._calculate_text_confidence(
                    user_description, 
                    response.text, 
                    disaster_type, 
                    location
                )
                
                return {
                    'success': True,
                    'description': response.text.strip(),
                    'confidence': confidence,
                    'source': 'gemini_ai_enhanced',
                    'original_description': user_description,
                    'disaster_type_suggested': self._extract_disaster_type(response.text),
                    'priority_suggested': self._extract_priority(response.text),
                    'confidence_factors': self._get_text_confidence_factors(user_description, response.text, disaster_type, location)
                }
            else:
                return self._fallback_response()
                
        except Exception as e:
            print(f"Error in Gemini text enhancement: {e}")
            return self._fallback_response()
    
    def analyze_emergency_situation(self, description, image_paths=None, disaster_type=None, location=None):
        """
        Comprehensive emergency analysis using Gemini AI
        """
        try:
            # Prepare content for analysis
            content_parts = []
            
            # Add text description
            if description:
                content_parts.append(f"Emergency Description: {description}")
            
            # Add disaster type and location context
            if disaster_type:
                content_parts.append(f"Reported Disaster Type: {disaster_type}")
            if location:
                content_parts.append(f"Location: {location}")
            
            # Add images if available
            if image_paths:
                for image_path in image_paths:
                    try:
                        with open(image_path, 'rb') as image_file:
                            image_data = image_file.read()
                        content_parts.append(image_data)
                    except Exception as e:
                        print(f"Error loading image {image_path}: {e}")
            
            # Create comprehensive analysis prompt
            prompt = """
            You are an emergency response AI analyst. Analyze the following emergency situation and provide:
            
            1. Emergency Level Assessment (LOW/MEDIUM/HIGH/CRITICAL)
            2. Suggested Priority Level (LOW/MEDIUM/HIGH/CRITICAL)
            3. Confidence Score (0.0-1.0)
            4. Fraud Risk Assessment (0.0-1.0, where 1.0 is high fraud risk)
            5. Key Observations
            6. Recommended Actions
            
            Respond in JSON format:
            {
                "emergency_level": "HIGH",
                "priority": "HIGH", 
                "confidence": 0.85,
                "fraud_score": 0.15,
                "observations": ["Key observation 1", "Key observation 2"],
                "recommendations": ["Action 1", "Action 2"],
                "is_emergency": true
            }
            """
            
            # Generate analysis
            response = self.model.generate_content([prompt] + content_parts)
            
            if response.text:
                # Try to parse JSON response
                import json
                try:
                    analysis_data = json.loads(response.text.strip())
                    return {
                        'success': True,
                        'is_emergency': analysis_data.get('is_emergency', True),
                        'confidence': analysis_data.get('confidence', 0.8),
                        'fraud_score': analysis_data.get('fraud_score', 0.1),
                        'emergency_level': analysis_data.get('emergency_level', 'MEDIUM'),
                        'priority': analysis_data.get('priority', 'MEDIUM'),
                        'observations': analysis_data.get('observations', []),
                        'recommendations': analysis_data.get('recommendations', []),
                        'source': 'gemini_ai_analysis'
                    }
                except json.JSONDecodeError:
                    # Fallback if JSON parsing fails
                    return self._parse_text_response(response.text)
            else:
                return self._fallback_analysis()
                
        except Exception as e:
            print(f"Error in Gemini emergency analysis: {e}")
            return self._fallback_analysis()
    
    def _create_emergency_prompt(self, disaster_type, location):
        """Create a prompt for emergency description generation with disaster-specific guidance"""
        base_prompt = """
        You are an emergency response AI assistant. Analyze this image and provide a detailed emergency description.
        
        Focus on:
        - What type of emergency/disaster is visible
        - Severity and urgency level
        - Number of people affected (if visible)
        - Immediate risks and dangers
        - Specific details that would help emergency responders
        
        Provide a clear, professional description in 2-3 sentences that would be useful for emergency services.
        """
        
        # Add disaster-specific guidance
        if disaster_type:
            disaster_guidance = self._get_disaster_specific_guidance(disaster_type)
            base_prompt += f"\n\nReported disaster type: {disaster_type}"
            base_prompt += f"\n\nDisaster-specific focus areas: {disaster_guidance}"
        
        if location:
            location_guidance = self._get_location_specific_guidance(location)
            base_prompt += f"\n\nLocation: {location}"
            base_prompt += f"\n\nLocation-specific considerations: {location_guidance}"
            
        return base_prompt
    
    def _get_disaster_specific_guidance(self, disaster_type):
        """Get disaster-specific guidance for AI prompts"""
        guidance_map = {
            'FLOOD': "Focus on water levels, flooding extent, trapped individuals, structural damage, evacuation needs, and water-related hazards",
            'FIRE': "Focus on fire intensity, smoke conditions, structural damage, trapped individuals, evacuation routes, and fire spread risk",
            'EARTHQUAKE': "Focus on structural damage, building collapse, trapped individuals, aftershock risks, and immediate safety concerns",
            'MEDICAL': "Focus on injury severity, number of casualties, medical equipment needs, accessibility, and emergency medical response requirements",
            'ACCIDENT': "Focus on vehicle damage, injury severity, road conditions, traffic impact, and immediate rescue needs",
            'CYCLONE': "Focus on wind damage, structural integrity, debris, evacuation needs, and weather-related hazards",
            'LANDSLIDE': "Focus on slope stability, debris flow, trapped individuals, structural damage, and geological risks"
        }
        return guidance_map.get(disaster_type, "Focus on general emergency indicators, severity, and immediate response needs")
    
    def _get_location_specific_guidance(self, location):
        """Get location-specific guidance for AI prompts"""
        location_lower = location.lower()
        
        # Urban area considerations
        if any(term in location_lower for term in ['city', 'urban', 'downtown', 'street', 'avenue', 'boulevard']):
            return "Consider urban density, building heights, traffic impact, emergency service access, and evacuation challenges"
        
        # Rural area considerations
        elif any(term in location_lower for term in ['rural', 'village', 'countryside', 'farm', 'field']):
            return "Consider limited emergency service access, remote location challenges, and potential communication difficulties"
        
        # Coastal area considerations
        elif any(term in location_lower for term in ['coast', 'beach', 'shore', 'harbor', 'port']):
            return "Consider coastal hazards, tidal conditions, marine rescue needs, and coastal infrastructure damage"
        
        # Mountain/hill area considerations
        elif any(term in location_lower for term in ['mountain', 'hill', 'peak', 'ridge', 'slope']):
            return "Consider elevation challenges, weather conditions, accessibility issues, and terrain-related risks"
        
        # Industrial area considerations
        elif any(term in location_lower for term in ['industrial', 'factory', 'plant', 'warehouse', 'manufacturing']):
            return "Consider industrial hazards, chemical risks, specialized equipment needs, and industrial safety protocols"
        
        else:
            return "Consider general location factors, accessibility, and local emergency response capabilities"
    
    def _extract_disaster_type(self, text):
        """Extract disaster type from AI response"""
        disaster_types = ['FLOOD', 'EARTHQUAKE', 'FIRE', 'CYCLONE', 'LANDSLIDE', 'MEDICAL', 'ACCIDENT']
        text_upper = text.upper()
        
        for disaster in disaster_types:
            if disaster.lower() in text_upper:
                return disaster
        return 'OTHER'
    
    def _extract_priority(self, text):
        """Extract priority level from AI response"""
        text_upper = text.upper()
        
        if any(word in text_upper for word in ['CRITICAL', 'SEVERE', 'LIFE-THREATENING', 'URGENT']):
            return 'CRITICAL'
        elif any(word in text_upper for word in ['HIGH', 'SERIOUS', 'DANGEROUS']):
            return 'HIGH'
        elif any(word in text_upper for word in ['MEDIUM', 'MODERATE']):
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _parse_text_response(self, text):
        """Parse text response when JSON parsing fails"""
        return {
            'success': True,
            'is_emergency': True,
            'confidence': 0.7,
            'fraud_score': 0.1,
            'emergency_level': 'MEDIUM',
            'priority': 'MEDIUM',
            'observations': [text[:200] + '...' if len(text) > 200 else text],
            'recommendations': ['Contact emergency services', 'Assess situation safety'],
            'source': 'gemini_ai_text_analysis'
        }
    
    def _fallback_response(self):
        """Fallback response when Gemini fails"""
        return {
            'success': False,
            'description': 'Unable to generate AI description at this time.',
            'confidence': 0.0,
            'source': 'fallback',
            'error': 'Gemini API unavailable'
        }
    
    def _fallback_analysis(self):
        """Fallback analysis when Gemini fails"""
        return {
            'success': False,
            'is_emergency': True,
            'confidence': 0.5,
            'fraud_score': 0.1,
            'emergency_level': 'MEDIUM',
            'priority': 'MEDIUM',
            'observations': ['AI analysis unavailable'],
            'recommendations': ['Manual review required'],
            'source': 'fallback_analysis',
            'error': 'Gemini API unavailable'
        }
    
    def _calculate_image_confidence(self, description, image_path, disaster_type=None, location=None):
        """
        Calculate dynamic confidence based on multiple factors
        """
        try:
            base_confidence = 0.75  # Base confidence for Gemini
            
            # Factor 1: Description quality and detail
            description_quality = self._assess_description_quality(description)
            quality_boost = description_quality * 0.15  # Up to 15% boost
            
            # Factor 2: Image quality assessment
            image_quality = self._assess_image_quality(image_path)
            image_boost = image_quality * 0.10  # Up to 10% boost
            
            # Factor 3: Context alignment (disaster type + location)
            context_alignment = self._assess_context_alignment(description, disaster_type, location)
            context_boost = context_alignment * 0.10  # Up to 10% boost
            
            # Factor 4: Emergency indicators strength
            emergency_strength = self._assess_emergency_indicators(description)
            emergency_boost = emergency_strength * 0.05  # Up to 5% boost
            
            # Calculate final confidence
            final_confidence = min(0.98, base_confidence + quality_boost + image_boost + context_boost + emergency_boost)
            
            return round(final_confidence, 3)
            
        except Exception as e:
            print(f"Error calculating image confidence: {e}")
            return 0.75  # Fallback confidence
    
    def _assess_description_quality(self, description):
        """
        Assess the quality and detail of the generated description
        """
        try:
            score = 0.0
            
            # Length factor (detailed descriptions are better)
            word_count = len(description.split())
            if word_count >= 20:
                score += 0.3
            elif word_count >= 10:
                score += 0.2
            elif word_count >= 5:
                score += 0.1
            
            # Specificity indicators
            specific_indicators = [
                'severity', 'urgent', 'critical', 'immediate', 'dangerous',
                'injured', 'trapped', 'damage', 'destruction', 'evacuation',
                'emergency services', 'rescue', 'medical', 'fire', 'flood'
            ]
            
            found_indicators = sum(1 for indicator in specific_indicators if indicator.lower() in description.lower())
            score += min(0.4, found_indicators * 0.05)
            
            # Professional language indicators
            professional_indicators = [
                'situation', 'incident', 'emergency', 'response', 'assistance',
                'authorities', 'services', 'personnel', 'equipment'
            ]
            
            found_professional = sum(1 for indicator in professional_indicators if indicator.lower() in description.lower())
            score += min(0.3, found_professional * 0.03)
            
            return min(1.0, score)
            
        except Exception as e:
            print(f"Error assessing description quality: {e}")
            return 0.5
    
    def _assess_image_quality(self, image_path):
        """
        Assess the quality of the uploaded image
        """
        try:
            from PIL import Image
            import os
            
            score = 0.0
            
            # Check if image exists and is readable
            if not os.path.exists(image_path):
                return 0.0
            
            with Image.open(image_path) as img:
                width, height = img.size
                
                # Resolution factor
                total_pixels = width * height
                if total_pixels >= 2000000:  # 2MP+
                    score += 0.4
                elif total_pixels >= 1000000:  # 1MP+
                    score += 0.3
                elif total_pixels >= 500000:  # 0.5MP+
                    score += 0.2
                else:
                    score += 0.1
                
                # Aspect ratio factor (closer to standard ratios is better)
                aspect_ratio = width / height
                if 0.7 <= aspect_ratio <= 1.4:  # Square-ish or standard ratios
                    score += 0.2
                elif 0.5 <= aspect_ratio <= 2.0:  # Acceptable ratios
                    score += 0.1
                
                # File size factor (larger files often have more detail)
                file_size = os.path.getsize(image_path)
                if file_size >= 1000000:  # 1MB+
                    score += 0.2
                elif file_size >= 500000:  # 500KB+
                    score += 0.1
                elif file_size >= 100000:  # 100KB+
                    score += 0.05
                
                # Color mode factor
                if img.mode in ['RGB', 'RGBA']:
                    score += 0.2
                elif img.mode == 'L':  # Grayscale
                    score += 0.1
            
            return min(1.0, score)
            
        except Exception as e:
            print(f"Error assessing image quality: {e}")
            return 0.3
    
    def _assess_context_alignment(self, description, disaster_type=None, location=None):
        """
        Assess how well the description aligns with the provided context
        """
        try:
            score = 0.0
            description_lower = description.lower()
            
            # Disaster type alignment
            if disaster_type:
                disaster_keywords = {
                    'FLOOD': ['water', 'flood', 'flooding', 'rain', 'overflow', 'drowning'],
                    'FIRE': ['fire', 'smoke', 'burning', 'flames', 'heat', 'smoke'],
                    'EARTHQUAKE': ['earthquake', 'shaking', 'tremor', 'ground', 'building', 'collapse'],
                    'MEDICAL': ['medical', 'injured', 'hurt', 'pain', 'hospital', 'ambulance'],
                    'ACCIDENT': ['accident', 'crash', 'collision', 'vehicle', 'car', 'road'],
                    'CYCLONE': ['wind', 'storm', 'cyclone', 'hurricane', 'tornado', 'damage'],
                    'LANDSLIDE': ['landslide', 'mud', 'rock', 'slope', 'mountain', 'debris']
                }
                
                if disaster_type in disaster_keywords:
                    keywords = disaster_keywords[disaster_type]
                    found_keywords = sum(1 for keyword in keywords if keyword in description_lower)
                    score += min(0.5, found_keywords * 0.1)
            
            # Location context alignment
            if location:
                location_indicators = ['location', 'area', 'street', 'building', 'near', 'at', 'in']
                found_location = sum(1 for indicator in location_indicators if indicator in description_lower)
                score += min(0.3, found_location * 0.05)
            
            # General emergency context
            emergency_context = ['emergency', 'urgent', 'help', 'assistance', 'rescue', 'danger']
            found_emergency = sum(1 for context in emergency_context if context in description_lower)
            score += min(0.2, found_emergency * 0.03)
            
            return min(1.0, score)
            
        except Exception as e:
            print(f"Error assessing context alignment: {e}")
            return 0.3
    
    def _assess_emergency_indicators(self, description):
        """
        Assess the strength of emergency indicators in the description
        """
        try:
            score = 0.0
            description_lower = description.lower()
            
            # High-priority emergency indicators
            high_priority = ['critical', 'urgent', 'immediate', 'life-threatening', 'severe', 'dangerous']
            high_count = sum(1 for indicator in high_priority if indicator in description_lower)
            score += min(0.4, high_count * 0.1)
            
            # Medium-priority emergency indicators
            medium_priority = ['emergency', 'help', 'assistance', 'rescue', 'injured', 'damage']
            medium_count = sum(1 for indicator in medium_priority if indicator in description_lower)
            score += min(0.3, medium_count * 0.05)
            
            # Action indicators
            action_indicators = ['need', 'require', 'must', 'should', 'evacuate', 'respond']
            action_count = sum(1 for indicator in action_indicators if indicator in description_lower)
            score += min(0.3, action_count * 0.05)
            
            return min(1.0, score)
            
        except Exception as e:
            print(f"Error assessing emergency indicators: {e}")
            return 0.3
    
    def _get_confidence_factors(self, description, image_path, disaster_type=None, location=None):
        """
        Get detailed confidence factors for transparency
        """
        try:
            return {
                'description_quality': self._assess_description_quality(description),
                'image_quality': self._assess_image_quality(image_path),
                'context_alignment': self._assess_context_alignment(description, disaster_type, location),
                'emergency_indicators': self._assess_emergency_indicators(description),
                'base_confidence': 0.75,
                'total_boost': (
                    self._assess_description_quality(description) * 0.15 +
                    self._assess_image_quality(image_path) * 0.10 +
                    self._assess_context_alignment(description, disaster_type, location) * 0.10 +
                    self._assess_emergency_indicators(description) * 0.05
                )
            }
        except Exception as e:
            print(f"Error getting confidence factors: {e}")
            return {'error': str(e)}
    
    def _calculate_text_confidence(self, original_description, enhanced_description, disaster_type=None, location=None):
        """
        Calculate dynamic confidence for text enhancement
        """
        try:
            base_confidence = 0.70  # Base confidence for text enhancement
            
            # Factor 1: Enhancement quality (how much better the enhanced version is)
            enhancement_quality = self._assess_enhancement_quality(original_description, enhanced_description)
            enhancement_boost = enhancement_quality * 0.20  # Up to 20% boost
            
            # Factor 2: Original description quality
            original_quality = self._assess_description_quality(original_description)
            original_boost = original_quality * 0.10  # Up to 10% boost
            
            # Factor 3: Context alignment
            context_alignment = self._assess_context_alignment(enhanced_description, disaster_type, location)
            context_boost = context_alignment * 0.10  # Up to 10% boost
            
            # Factor 4: Emergency indicators improvement
            emergency_improvement = self._assess_emergency_improvement(original_description, enhanced_description)
            emergency_boost = emergency_improvement * 0.10  # Up to 10% boost
            
            # Calculate final confidence
            final_confidence = min(0.95, base_confidence + enhancement_boost + original_boost + context_boost + emergency_boost)
            
            return round(final_confidence, 3)
            
        except Exception as e:
            print(f"Error calculating text confidence: {e}")
            return 0.70  # Fallback confidence
    
    def _assess_enhancement_quality(self, original, enhanced):
        """
        Assess how much the enhanced description improves over the original
        """
        try:
            score = 0.0
            
            # Length improvement
            original_words = len(original.split())
            enhanced_words = len(enhanced.split())
            
            if enhanced_words > original_words * 1.5:  # 50% more words
                score += 0.3
            elif enhanced_words > original_words * 1.2:  # 20% more words
                score += 0.2
            elif enhanced_words > original_words:  # Any improvement
                score += 0.1
            
            # Professional language improvement
            professional_terms = [
                'emergency', 'situation', 'incident', 'response', 'assistance',
                'authorities', 'services', 'personnel', 'equipment', 'immediate',
                'critical', 'urgent', 'severe', 'dangerous'
            ]
            
            original_professional = sum(1 for term in professional_terms if term.lower() in original.lower())
            enhanced_professional = sum(1 for term in professional_terms if term.lower() in enhanced.lower())
            
            if enhanced_professional > original_professional:
                score += min(0.4, (enhanced_professional - original_professional) * 0.1)
            
            # Specificity improvement
            specific_terms = [
                'severity', 'injured', 'trapped', 'damage', 'destruction',
                'evacuation', 'rescue', 'medical', 'fire', 'flood', 'earthquake'
            ]
            
            original_specific = sum(1 for term in specific_terms if term.lower() in original.lower())
            enhanced_specific = sum(1 for term in specific_terms if term.lower() in enhanced.lower())
            
            if enhanced_specific > original_specific:
                score += min(0.3, (enhanced_specific - original_specific) * 0.1)
            
            return min(1.0, score)
            
        except Exception as e:
            print(f"Error assessing enhancement quality: {e}")
            return 0.3
    
    def _assess_emergency_improvement(self, original, enhanced):
        """
        Assess how much the emergency indicators improved
        """
        try:
            score = 0.0
            
            # Emergency urgency indicators
            urgency_indicators = ['urgent', 'critical', 'immediate', 'emergency', 'help', 'assistance']
            
            original_urgency = sum(1 for indicator in urgency_indicators if indicator.lower() in original.lower())
            enhanced_urgency = sum(1 for indicator in urgency_indicators if indicator.lower() in enhanced.lower())
            
            if enhanced_urgency > original_urgency:
                score += min(0.5, (enhanced_urgency - original_urgency) * 0.15)
            
            # Action indicators
            action_indicators = ['need', 'require', 'must', 'should', 'evacuate', 'respond', 'call']
            
            original_actions = sum(1 for indicator in action_indicators if indicator.lower() in original.lower())
            enhanced_actions = sum(1 for indicator in action_indicators if indicator.lower() in enhanced.lower())
            
            if enhanced_actions > original_actions:
                score += min(0.5, (enhanced_actions - original_actions) * 0.1)
            
            return min(1.0, score)
            
        except Exception as e:
            print(f"Error assessing emergency improvement: {e}")
            return 0.3
    
    def _get_text_confidence_factors(self, original_description, enhanced_description, disaster_type=None, location=None):
        """
        Get detailed confidence factors for text enhancement
        """
        try:
            return {
                'enhancement_quality': self._assess_enhancement_quality(original_description, enhanced_description),
                'original_quality': self._assess_description_quality(original_description),
                'context_alignment': self._assess_context_alignment(enhanced_description, disaster_type, location),
                'emergency_improvement': self._assess_emergency_improvement(original_description, enhanced_description),
                'base_confidence': 0.70,
                'total_boost': (
                    self._assess_enhancement_quality(original_description, enhanced_description) * 0.20 +
                    self._assess_description_quality(original_description) * 0.10 +
                    self._assess_context_alignment(enhanced_description, disaster_type, location) * 0.10 +
                    self._assess_emergency_improvement(original_description, enhanced_description) * 0.10
                )
            }
        except Exception as e:
            print(f"Error getting text confidence factors: {e}")
            return {'error': str(e)}
