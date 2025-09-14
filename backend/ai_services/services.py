import os
from django.conf import settings
from PIL import Image
import random
from .gemini_service import GeminiDescriptionService

class AIVerificationService:
    def __init__(self):
        self.emergency_keywords = [
            'help', 'emergency', 'urgent', 'fire', 'flood', 'earthquake',
            'accident', 'injured', 'trapped', 'rescue', 'danger', 'critical',
            'sos', 'disaster', 'emergency', 'help needed', 'urgent assistance'
        ]
        # Initialize Gemini service for AI description generation
        try:
            self.gemini_service = GeminiDescriptionService()
        except Exception as e:
            print(f"Warning: Could not initialize Gemini service: {e}")
            self.gemini_service = None
    
    def verify_image(self, image_path):
        """Mock image verification service (will be replaced with real AI later)"""
        try:
            # For now, return a mock verification result
            # In production, this will use YOLO or other AI models
            
            # Simulate AI processing delay
            import time
            time.sleep(0.1)
            
            # Mock emergency detection based on image size/format
            try:
                with Image.open(image_path) as img:
                    width, height = img.size
                    # Simple heuristic: larger images might be more serious
                    is_emergency = width > 800 or height > 600
            except:
                is_emergency = random.choice([True, False])
            
            # Mock confidence and priority
            confidence = random.uniform(0.7, 0.95)
            priority = random.choice(['LOW', 'MEDIUM', 'HIGH'])
            
            return {
                'is_emergency': is_emergency,
                'confidence': round(confidence, 2),
                'detected_objects': ['person', 'vehicle'] if is_emergency else ['building'],
                'suggested_priority': priority,
                'analysis_complete': True,
                'note': 'Mock AI service - replace with real AI in production'
            }
            
        except Exception as e:
            print(f"Error in image verification: {e}")
            return self.mock_verification_result()
    
    def classify_text(self, text):
        """Classify emergency text description using enhanced keyword matching with improved confidence"""
        try:
            text_lower = text.lower()
            emergency_score = sum(1 for keyword in self.emergency_keywords if keyword in text_lower)
            
            # Enhanced confidence calculation
            confidence = self._calculate_enhanced_text_confidence(text, emergency_score)
            
            # Determine emergency level based on keyword count
            if emergency_score >= 3:
                emergency_level = 'CRITICAL'
                priority = 'HIGH'
            elif emergency_score >= 2:
                emergency_level = 'HIGH'
                priority = 'MEDIUM'
            elif emergency_score >= 1:
                emergency_level = 'MEDIUM'
                priority = 'LOW'
            else:
                emergency_level = 'LOW'
                priority = 'LOW'
            
            return {
                'emergency_level': emergency_level,
                'priority': priority,
                'confidence': confidence,
                'keywords_found': [kw for kw in self.emergency_keywords if kw in text_lower],
                'analysis_complete': True,
                'confidence_factors': self._get_text_confidence_factors(text, emergency_score)
            }
            
        except Exception as e:
            print(f"Error in text classification: {e}")
            return self.mock_text_classification()
    
    def mock_verification_result(self):
        """Fallback mock result"""
        return {
            'is_emergency': True,
            'confidence': 0.8,
            'detected_objects': ['person'],
            'suggested_priority': 'MEDIUM',
            'analysis_complete': True,
            'note': 'Mock service - AI models not loaded'
        }
    
    def mock_text_classification(self):
        """Fallback mock text classification"""
        return {
            'emergency_level': 'MEDIUM',
            'priority': 'MEDIUM',
            'confidence': 0.7,
            'keywords_found': ['emergency'],
            'analysis_complete': True,
            'note': 'Mock service - AI models not loaded'
        }
    
    def predict_disaster_risk(self, location_data):
        """Mock disaster risk prediction (will use real ML models later)"""
        try:
            # Mock risk assessment based on location
            risk_factors = {
                'flood_risk': random.uniform(0.1, 0.9),
                'earthquake_risk': random.uniform(0.05, 0.8),
                'fire_risk': random.uniform(0.1, 0.7),
                'cyclone_risk': random.uniform(0.05, 0.6)
            }
            
            # Determine overall risk level
            max_risk = max(risk_factors.values())
            if max_risk > 0.7:
                overall_risk = 'HIGH'
            elif max_risk > 0.4:
                overall_risk = 'MEDIUM'
            else:
                overall_risk = 'LOW'
            
            return {
                'overall_risk': overall_risk,
                'risk_factors': risk_factors,
                'recommendations': [
                    'Monitor weather updates',
                    'Prepare emergency kit',
                    'Know evacuation routes'
                ],
                'prediction_confidence': random.uniform(0.6, 0.9),
                'note': 'Mock prediction service - replace with real ML models in production'
            }
            
        except Exception as e:
            print(f"Error in disaster risk prediction: {e}")
            return {
                'overall_risk': 'UNKNOWN',
                'risk_factors': {},
                'recommendations': ['Service temporarily unavailable'],
                'prediction_confidence': 0.0,
                'error': str(e)
            }
    
    def analyze_report(self, text_description=None, image_paths=None, disaster_type=None, location=None):
        """
        Comprehensive report analysis using both traditional methods and Gemini AI
        """
        try:
            # Initialize result structure
            analysis_result = {
                'is_emergency': False,
                'confidence': 0.0,
                'fraud_score': 0.0,
                'emergency_level': 'LOW',
                'priority': 'LOW',
                'ai_description': None,
                'enhanced_description': None,
                'observations': [],
                'recommendations': [],
                'source': 'hybrid_analysis'
            }
            
            # Use Gemini AI for comprehensive analysis if available
            if self.gemini_service:
                try:
                    gemini_analysis = self.gemini_service.analyze_emergency_situation(
                        description=text_description,
                        image_paths=image_paths,
                        disaster_type=disaster_type,
                        location=location
                    )
                    
                    if gemini_analysis.get('success', False):
                        analysis_result.update({
                            'is_emergency': gemini_analysis.get('is_emergency', False),
                            'confidence': gemini_analysis.get('confidence', 0.0),
                            'fraud_score': gemini_analysis.get('fraud_score', 0.0),
                            'emergency_level': gemini_analysis.get('emergency_level', 'LOW'),
                            'priority': gemini_analysis.get('priority', 'LOW'),
                            'observations': gemini_analysis.get('observations', []),
                            'recommendations': gemini_analysis.get('recommendations', []),
                            'source': 'gemini_ai'
                        })
                        
                        # Generate AI description if we have images
                        if image_paths and len(image_paths) > 0:
                            ai_desc_result = self.gemini_service.generate_description_from_image(
                                image_paths[0], disaster_type, location
                            )
                            if ai_desc_result.get('success', False):
                                analysis_result['ai_description'] = ai_desc_result.get('description')
                        
                        # Enhance text description if provided
                        if text_description:
                            enhanced_desc_result = self.gemini_service.generate_description_from_text(
                                text_description, disaster_type, location
                            )
                            if enhanced_desc_result.get('success', False):
                                analysis_result['enhanced_description'] = enhanced_desc_result.get('description')
                        
                        return analysis_result
                        
                except Exception as e:
                    print(f"Gemini analysis failed, falling back to traditional methods: {e}")
            
            # Fallback to traditional analysis methods
            return self._traditional_analysis(text_description, image_paths, disaster_type, location)
            
        except Exception as e:
            print(f"Error in comprehensive report analysis: {e}")
            return self._fallback_analysis()
    
    def generate_ai_description(self, image_path, disaster_type=None, location=None):
        """
        Generate AI description from image using Gemini
        """
        if self.gemini_service:
            try:
                return self.gemini_service.generate_description_from_image(
                    image_path, disaster_type, location
                )
            except Exception as e:
                print(f"Error generating AI description: {e}")
                return self._fallback_description()
        else:
            return self._fallback_description()
    
    def enhance_description(self, user_description, disaster_type=None, location=None):
        """
        Enhance user description using Gemini AI
        """
        if self.gemini_service:
            try:
                return self.gemini_service.generate_description_from_text(
                    user_description, disaster_type, location
                )
            except Exception as e:
                print(f"Error enhancing description: {e}")
                return self._fallback_enhancement(user_description)
        else:
            return self._fallback_enhancement(user_description)
    
    def generate_description_from_context(self, disaster_type, location, priority='MEDIUM'):
        """
        Generate AI description from disaster type and location context
        """
        try:
            # Use Gemini AI if available
            if self.gemini_service:
                try:
                    # Create a context prompt for description generation
                    context_prompt = f"Generate a detailed emergency report description for a {disaster_type} incident at {location} with {priority} priority. Include specific details about the situation, potential risks, and response needs."
                    
                    gemini_result = self.gemini_service.generate_description_from_text(
                        context_prompt, disaster_type, location
                    )
                    
                    if gemini_result.get('success', False):
                        return {
                            'success': True,
                            'description': gemini_result.get('description'),
                            'confidence': gemini_result.get('confidence', 0.8),
                            'source': 'gemini_ai'
                        }
                except Exception as e:
                    print(f"Gemini description generation failed: {e}")
            
            # Fallback to template-based generation
            return self._generate_template_description(disaster_type, location, priority)
            
        except Exception as e:
            print(f"Error generating description from context: {e}")
            return self._fallback_context_description(disaster_type, location, priority)
    
    def _generate_template_description(self, disaster_type, location, priority):
        """
        Generate description using predefined templates
        """
        try:
            # Get disaster-specific template
            template = self._get_disaster_template(disaster_type)
            
            # Customize based on priority
            priority_context = self._get_priority_context(priority)
            
            # Generate description
            description = template.format(
                disaster_type=disaster_type.lower(),
                location=location,
                priority=priority.lower(),
                priority_context=priority_context
            )
            
            return {
                'success': True,
                'description': description,
                'confidence': 0.7,
                'source': 'template_generation'
            }
            
        except Exception as e:
            print(f"Error in template generation: {e}")
            return self._fallback_context_description(disaster_type, location, priority)
    
    def _get_disaster_template(self, disaster_type):
        """
        Get disaster-specific description template
        """
        templates = {
            'FLOOD': "Emergency {disaster_type} situation reported at {location}. Water levels are rising rapidly with significant flooding observed. This is a {priority} priority incident requiring immediate attention. Multiple areas are affected with potential for structural damage and safety risks. Evacuation may be necessary for affected residents. Emergency services have been notified and are responding to the scene. The situation is developing and poses significant risk to public safety and property.",
            
            'FIRE': "Emergency {disaster_type} incident reported at {location}. Flames and smoke are visible with potential for rapid spread. This is a {priority} priority incident requiring immediate response. The fire poses significant risk to nearby structures and individuals. Evacuation of affected and surrounding areas may be necessary. Fire department and emergency services are responding. The situation requires immediate attention due to {priority_context}.",
            
            'EARTHQUAKE': "Emergency {disaster_type} event reported at {location}. Significant ground movement and structural damage have been observed. This is a {priority} priority incident with potential for casualties and further damage. Aftershocks are possible and pose ongoing risks. Immediate assessment of structural integrity and evacuation of affected buildings is required. Emergency services are responding to assess damage and provide assistance. The situation requires urgent attention due to {priority_context}.",
            
            'MEDICAL': "Medical emergency reported at {location}. Multiple casualties with varying degrees of injury severity. This is a {priority} priority incident requiring immediate medical response. Emergency medical services and ambulances are needed urgently. The situation requires immediate attention due to {priority_context}. Medical personnel and equipment are being dispatched to the scene. Patient stabilization and transport to medical facilities is the priority.",
            
            'ACCIDENT': "Traffic accident reported at {location}. Vehicle damage and potential casualties have been observed. This is a {priority} priority incident requiring immediate response. Road access may be affected and traffic control measures are needed. Emergency medical services and law enforcement are responding. The situation requires immediate attention due to {priority_context}. Rescue operations and medical assistance are being coordinated.",
            
            'CYCLONE': "Cyclone emergency reported at {location}. High winds and severe weather conditions are affecting the area. This is a {priority} priority incident with potential for significant damage. Evacuation of affected areas may be necessary for safety. Emergency services are responding to multiple incidents. The situation requires immediate attention due to {priority_context}. Weather conditions are deteriorating and pose ongoing risks.",
            
            'LANDSLIDE': "Landslide emergency reported at {location}. Significant ground movement and debris flow have been observed. This is a {priority} priority incident with potential for structural damage and safety risks. Evacuation of affected areas is recommended. Emergency services are responding to assess the situation and provide assistance. The situation requires immediate attention due to {priority_context}. Geological assessment and safety measures are being implemented."
        }
        
        return templates.get(disaster_type, "Emergency {disaster_type} situation reported at {location}. This is a {priority} priority incident requiring immediate attention. The situation is developing and poses potential risk to public safety. Emergency services have been notified and are responding to the scene. The situation requires immediate attention due to {priority_context}.")
    
    def _get_priority_context(self, priority):
        """
        Get priority-specific context
        """
        priority_contexts = {
            'CRITICAL': 'the critical nature and immediate threat to life and safety',
            'HIGH': 'the high risk and urgent response requirements',
            'MEDIUM': 'the moderate risk and timely response needs',
            'LOW': 'the need for appropriate monitoring and response'
        }
        
        return priority_contexts.get(priority, 'the need for appropriate response and monitoring')
    
    def _fallback_context_description(self, disaster_type, location, priority):
        """
        Fallback description when all generation methods fail
        """
        return {
            'success': False,
            'description': f"Emergency {disaster_type} situation reported at {location}. This is a {priority} priority incident requiring immediate attention. The situation is developing and poses potential risk to public safety. Emergency services have been notified and are responding to the scene.",
            'confidence': 0.5,
            'source': 'fallback'
        }
    
    def _traditional_analysis(self, text_description=None, image_paths=None, disaster_type=None, location=None):
        """
        Traditional analysis using keyword matching and heuristics
        """
        analysis_result = {
            'is_emergency': False,
            'confidence': 0.0,
            'fraud_score': 0.1,
            'emergency_level': 'LOW',
            'priority': 'LOW',
            'observations': [],
            'recommendations': ['Manual review recommended'],
            'source': 'traditional_analysis'
        }
        
        # Analyze text description
        if text_description:
            text_analysis = self.classify_text(text_description)
            analysis_result.update({
                'is_emergency': text_analysis.get('emergency_level') in ['HIGH', 'CRITICAL'],
                'confidence': text_analysis.get('confidence', 0.0),
                'emergency_level': text_analysis.get('emergency_level', 'LOW'),
                'priority': text_analysis.get('priority', 'LOW'),
                'observations': [f"Keywords found: {', '.join(text_analysis.get('keywords_found', []))}"]
            })
        
        # Analyze images if available
        if image_paths:
            image_analysis = self.verify_image(image_paths[0])
            if image_analysis.get('is_emergency', False):
                analysis_result.update({
                    'is_emergency': True,
                    'confidence': max(analysis_result.get('confidence', 0.0), image_analysis.get('confidence', 0.0)),
                    'observations': analysis_result.get('observations', []) + [f"Image analysis: {image_analysis.get('detected_objects', [])}"]
                })
        
        return analysis_result
    
    def _fallback_analysis(self):
        """Fallback analysis when all methods fail"""
        return {
            'is_emergency': True,
            'confidence': 0.5,
            'fraud_score': 0.1,
            'emergency_level': 'MEDIUM',
            'priority': 'MEDIUM',
            'observations': ['Analysis service temporarily unavailable'],
            'recommendations': ['Manual review required'],
            'source': 'fallback'
        }
    
    def _fallback_description(self):
        """Fallback description when AI generation fails"""
        return {
            'success': False,
            'description': 'Unable to generate AI description. Please provide a manual description.',
            'confidence': 0.0,
            'source': 'fallback'
        }
    
    def _fallback_enhancement(self, original_description):
        """Fallback enhancement when AI enhancement fails"""
        return {
            'success': False,
            'description': original_description,
            'confidence': 0.0,
            'source': 'fallback',
            'original_description': original_description
        }
    
    def _calculate_enhanced_text_confidence(self, text, emergency_score):
        """
        Calculate enhanced confidence for text classification
        """
        try:
            base_confidence = 0.4  # Base confidence for keyword matching
            
            # Factor 1: Emergency keyword score
            keyword_boost = min(0.3, emergency_score * 0.1)  # Up to 30% boost
            
            # Factor 2: Text length and detail
            word_count = len(text.split())
            length_boost = 0.0
            if word_count >= 20:
                length_boost = 0.15
            elif word_count >= 10:
                length_boost = 0.10
            elif word_count >= 5:
                length_boost = 0.05
            
            # Factor 3: Specificity indicators
            specificity_indicators = [
                'injured', 'trapped', 'damage', 'destruction', 'evacuation',
                'rescue', 'medical', 'fire', 'flood', 'earthquake', 'accident'
            ]
            specificity_count = sum(1 for indicator in specificity_indicators if indicator.lower() in text.lower())
            specificity_boost = min(0.15, specificity_count * 0.03)
            
            # Factor 4: Urgency indicators
            urgency_indicators = ['urgent', 'critical', 'immediate', 'emergency', 'help', 'assistance']
            urgency_count = sum(1 for indicator in urgency_indicators if indicator.lower() in text.lower())
            urgency_boost = min(0.10, urgency_count * 0.02)
            
            # Factor 5: Location and context indicators
            context_indicators = ['location', 'area', 'street', 'building', 'near', 'at', 'in']
            context_count = sum(1 for indicator in context_indicators if indicator.lower() in text.lower())
            context_boost = min(0.10, context_count * 0.02)
            
            # Calculate final confidence
            final_confidence = min(0.95, base_confidence + keyword_boost + length_boost + specificity_boost + urgency_boost + context_boost)
            
            return round(final_confidence, 3)
            
        except Exception as e:
            print(f"Error calculating enhanced text confidence: {e}")
            return 0.5  # Fallback confidence
    
    def _get_text_confidence_factors(self, text, emergency_score):
        """
        Get detailed confidence factors for text classification
        """
        try:
            word_count = len(text.split())
            
            # Calculate individual factors
            keyword_boost = min(0.3, emergency_score * 0.1)
            
            length_boost = 0.0
            if word_count >= 20:
                length_boost = 0.15
            elif word_count >= 10:
                length_boost = 0.10
            elif word_count >= 5:
                length_boost = 0.05
            
            specificity_indicators = [
                'injured', 'trapped', 'damage', 'destruction', 'evacuation',
                'rescue', 'medical', 'fire', 'flood', 'earthquake', 'accident'
            ]
            specificity_count = sum(1 for indicator in specificity_indicators if indicator.lower() in text.lower())
            specificity_boost = min(0.15, specificity_count * 0.03)
            
            urgency_indicators = ['urgent', 'critical', 'immediate', 'emergency', 'help', 'assistance']
            urgency_count = sum(1 for indicator in urgency_indicators if indicator.lower() in text.lower())
            urgency_boost = min(0.10, urgency_count * 0.02)
            
            context_indicators = ['location', 'area', 'street', 'building', 'near', 'at', 'in']
            context_count = sum(1 for indicator in context_indicators if indicator.lower() in text.lower())
            context_boost = min(0.10, context_count * 0.02)
            
            return {
                'base_confidence': 0.4,
                'keyword_boost': keyword_boost,
                'length_boost': length_boost,
                'specificity_boost': specificity_boost,
                'urgency_boost': urgency_boost,
                'context_boost': context_boost,
                'total_boost': keyword_boost + length_boost + specificity_boost + urgency_boost + context_boost,
                'word_count': word_count,
                'emergency_score': emergency_score
            }
            
        except Exception as e:
            print(f"Error getting text confidence factors: {e}")
            return {'error': str(e)}
    
    def get_disaster_suggestions(self, disaster_type, location=None):
        """
        Get disaster-specific description suggestions
        """
        try:
            suggestions = {
                'disaster_type': disaster_type,
                'location': location,
                'suggestions': [],
                'key_points': [],
                'example_descriptions': []
            }
            
            # Get disaster-specific suggestions
            disaster_suggestions = self._get_disaster_specific_suggestions(disaster_type)
            suggestions['suggestions'].extend(disaster_suggestions)
            
            # Get location-specific suggestions
            if location:
                location_suggestions = self._get_location_specific_suggestions(location)
                suggestions['suggestions'].extend(location_suggestions)
            
            # Get key points to include
            suggestions['key_points'] = self._get_key_points_for_disaster(disaster_type)
            
            # Get example descriptions
            suggestions['example_descriptions'] = self._get_example_descriptions(disaster_type, location)
            
            return suggestions
            
        except Exception as e:
            print(f"Error getting disaster suggestions: {e}")
            return {
                'disaster_type': disaster_type,
                'location': location,
                'suggestions': ['Please provide a detailed description of the emergency situation'],
                'key_points': ['Severity', 'Location details', 'Number of people affected'],
                'example_descriptions': ['Emergency situation requiring immediate assistance'],
                'error': str(e)
            }
    
    def _get_disaster_specific_suggestions(self, disaster_type):
        """Get disaster-specific description suggestions"""
        suggestions_map = {
            'FLOOD': [
                "Describe water levels and flooding extent",
                "Mention any trapped individuals or vehicles",
                "Include structural damage details",
                "Note evacuation needs or ongoing rescue operations",
                "Specify water-related hazards (electrical, contamination)"
            ],
            'FIRE': [
                "Describe fire intensity and spread",
                "Mention smoke conditions and visibility",
                "Include structural damage assessment",
                "Note trapped individuals or evacuation needs",
                "Specify fire spread risk to nearby structures"
            ],
            'EARTHQUAKE': [
                "Describe structural damage and building collapse",
                "Mention trapped individuals or casualties",
                "Include aftershock risks and safety concerns",
                "Note immediate evacuation needs",
                "Specify infrastructure damage (roads, utilities)"
            ],
            'MEDICAL': [
                "Describe injury severity and number of casualties",
                "Mention specific medical equipment needs",
                "Include accessibility and location details",
                "Note emergency medical response requirements",
                "Specify any hazardous conditions affecting rescue"
            ],
            'ACCIDENT': [
                "Describe vehicle damage and collision details",
                "Mention injury severity and number of casualties",
                "Include road conditions and traffic impact",
                "Note immediate rescue and medical needs",
                "Specify any hazardous materials or fuel leaks"
            ],
            'CYCLONE': [
                "Describe wind damage and structural integrity",
                "Mention debris and flying objects",
                "Include evacuation needs and shelter requirements",
                "Note weather conditions and safety risks",
                "Specify infrastructure damage and power outages"
            ],
            'LANDSLIDE': [
                "Describe slope stability and debris flow",
                "Mention trapped individuals or structures",
                "Include geological risks and ongoing threats",
                "Note evacuation needs and safe zones",
                "Specify structural damage and access routes"
            ]
        }
        
        return suggestions_map.get(disaster_type, [
            "Describe the emergency situation in detail",
            "Mention severity and urgency level",
            "Include number of people affected",
            "Note immediate risks and dangers",
            "Specify location and accessibility details"
        ])
    
    def _get_location_specific_suggestions(self, location):
        """Get location-specific description suggestions"""
        location_lower = location.lower()
        
        if any(term in location_lower for term in ['city', 'urban', 'downtown', 'street']):
            return [
                "Mention building heights and urban density",
                "Include traffic impact and road closures",
                "Note emergency service access challenges",
                "Specify evacuation route difficulties"
            ]
        elif any(term in location_lower for term in ['rural', 'village', 'countryside']):
            return [
                "Mention limited emergency service access",
                "Include communication difficulties",
                "Note remote location challenges",
                "Specify transportation and access issues"
            ]
        elif any(term in location_lower for term in ['coast', 'beach', 'shore']):
            return [
                "Mention coastal hazards and tidal conditions",
                "Include marine rescue needs",
                "Note coastal infrastructure damage",
                "Specify weather and sea conditions"
            ]
        elif any(term in location_lower for term in ['mountain', 'hill', 'peak']):
            return [
                "Mention elevation and terrain challenges",
                "Include weather conditions",
                "Note accessibility issues",
                "Specify terrain-related risks"
            ]
        else:
            return [
                "Include specific location details",
                "Mention accessibility and access routes",
                "Note local emergency response capabilities"
            ]
    
    def _get_key_points_for_disaster(self, disaster_type):
        """Get key points to include in descriptions for specific disasters"""
        key_points_map = {
            'FLOOD': ['Water levels', 'Flooding extent', 'Trapped individuals', 'Structural damage', 'Evacuation needs'],
            'FIRE': ['Fire intensity', 'Smoke conditions', 'Structural damage', 'Trapped individuals', 'Evacuation routes'],
            'EARTHQUAKE': ['Structural damage', 'Building collapse', 'Trapped individuals', 'Aftershock risks', 'Infrastructure damage'],
            'MEDICAL': ['Injury severity', 'Number of casualties', 'Medical equipment needs', 'Accessibility', 'Emergency response'],
            'ACCIDENT': ['Vehicle damage', 'Injury severity', 'Road conditions', 'Traffic impact', 'Rescue needs'],
            'CYCLONE': ['Wind damage', 'Structural integrity', 'Debris', 'Evacuation needs', 'Weather conditions'],
            'LANDSLIDE': ['Slope stability', 'Debris flow', 'Trapped individuals', 'Geological risks', 'Access routes']
        }
        
        return key_points_map.get(disaster_type, ['Severity', 'Location details', 'Number of people affected', 'Immediate risks', 'Response needs'])
    
    def _get_example_descriptions(self, disaster_type, location=None):
        """Get example descriptions for specific disaster types"""
        examples_map = {
            'FLOOD': [
                "Severe flooding with water levels reaching 2 meters. Multiple vehicles trapped in floodwaters. Immediate evacuation required for 15+ residents. Structural damage to ground floor buildings.",
                "Flash flood emergency with rapidly rising water levels. Several individuals trapped in vehicles. Evacuation in progress. Road access completely blocked."
            ],
            'FIRE': [
                "Large structure fire with heavy smoke and flames visible. Multiple floors affected. Evacuation in progress. Fire department responding. Potential for fire spread to adjacent buildings.",
                "Vehicle fire with explosion risk. Traffic blocked in both directions. Emergency services on scene. Evacuation of nearby buildings recommended."
            ],
            'EARTHQUAKE': [
                "Major earthquake with significant structural damage. Multiple buildings collapsed. Casualties reported. Aftershocks ongoing. Immediate rescue operations required.",
                "Earthquake with moderate damage. Building cracks and structural instability. Evacuation of affected buildings in progress. Emergency services responding."
            ],
            'MEDICAL': [
                "Medical emergency with multiple casualties. Severe injuries requiring immediate medical attention. Ambulance and medical personnel needed urgently. Location accessible by emergency vehicles.",
                "Mass casualty incident with 10+ injured individuals. Medical equipment and personnel required immediately. Emergency medical response in progress."
            ],
            'ACCIDENT': [
                "Multi-vehicle collision with multiple casualties. Road completely blocked. Emergency services responding. Medical evacuation required for severely injured individuals.",
                "Single vehicle accident with driver trapped. Vehicle damage significant. Road partially blocked. Emergency rescue and medical response needed."
            ],
            'CYCLONE': [
                "Severe cyclone with high winds causing structural damage. Multiple buildings affected. Evacuation centers activated. Emergency services responding to multiple incidents.",
                "Cyclone conditions with flying debris and structural damage. Power outages reported. Evacuation recommended for affected areas. Emergency response in progress."
            ],
            'LANDSLIDE': [
                "Major landslide with debris blocking access road. Multiple structures at risk. Evacuation of affected area in progress. Geological assessment required.",
                "Landslide with significant debris flow. Road access blocked. Structures damaged. Evacuation recommended for safety. Emergency response coordinating rescue efforts."
            ]
        }
        
        base_examples = examples_map.get(disaster_type, [
            "Emergency situation requiring immediate assistance. Multiple individuals affected. Emergency services responding.",
            "Critical incident with casualties reported. Immediate response required. Location accessible for emergency vehicles."
        ])
        
        # Add location-specific context if available
        if location:
            location_context = f" Location: {location}."
            base_examples = [example + location_context for example in base_examples]
        
        return base_examples
