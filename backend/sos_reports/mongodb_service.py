"""
MongoDB service for SOS Reports
Handles all database operations for reports using MongoDB
"""
from pymongo import MongoClient
import ssl
from django.conf import settings
from datetime import datetime
from django.utils import timezone
import json
import math
import uuid
from typing import List, Dict, Optional, Any
from bson import ObjectId

class SOSReportMongoDBService:
    """Service class for SOS Report operations with MongoDB"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            # Get connection string from environment variables
            connection_string = settings.MONGODB_SETTINGS['host']
            database_name = settings.MONGODB_SETTINGS['db']
            
            # PyMongo 4+: avoid legacy SSL kwargs. Use a clean SRV URI or modern tls* options in the URI if needed.
            self.client = MongoClient(connection_string, serverSelectionTimeoutMS=10000)
            self.db = self.client[database_name]
            
            # Test connection
            self.client.admin.command('ping')
            print("✅ Connected to MongoDB Atlas for SOS Reports")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.client = None
            self.db = None
    
    def _convert_objectids_to_strings(self, data):
        """Recursively convert ObjectId instances to strings in a dictionary"""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, ObjectId):
                    data[key] = str(value)
                elif isinstance(value, (dict, list)):
                    self._convert_objectids_to_strings(value)
        elif isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, ObjectId):
                    data[i] = str(item)
                elif isinstance(item, (dict, list)):
                    self._convert_objectids_to_strings(item)
    
    def get_reports(self, filters: Dict = None, limit: int = 100, skip: int = 0, user_id: Optional[int] = None) -> List[Dict]:
        """Get reports from MongoDB with optional filtering"""
        try:
            if not self.db:
                return []
            
            collection = self.db['emergency_reports']
            query = {}
            
            # Apply filters
            if filters:
                query.update(filters)
            
            # Filter by user if specified
            if user_id:
                query['user_id'] = user_id
            
            # Execute query
            cursor = collection.find(query).sort('created_at', -1).skip(skip).limit(limit)
            reports = list(cursor)
            
            # Convert ObjectId to string and format dates
            for report in reports:
                if '_id' in report:
                    report['id'] = str(report['_id'])
                    del report['_id']
                
                # Convert any remaining ObjectId fields to strings
                self._convert_objectids_to_strings(report)
                
                # Ensure created_at is properly formatted
                if 'created_at' in report and isinstance(report['created_at'], datetime):
                    report['created_at'] = report['created_at'].isoformat()
                
                if 'updated_at' in report and isinstance(report['updated_at'], datetime):
                    report['updated_at'] = report['updated_at'].isoformat()
                
                # Fix image URLs - handle both Cloudinary and local storage
                if 'media' in report and report['media']:
                    for media_item in report['media']:
                        # Check if it's already a Cloudinary URL
                        if 'url' in media_item and media_item['url'] and media_item['url'].startswith('http'):
                            # Cloudinary URL - use as is
                            media_item['file_url'] = media_item['url']
                            media_item['image_url'] = media_item['url']
                            if 'file' not in media_item:
                                media_item['file'] = media_item['url']
                        elif 'file' in media_item and media_item['file']:
                            # Local file - convert to full URL
                            file_path = media_item['file']
                            if not file_path.startswith('http'):
                                full_url = f"http://localhost:8000/media/{file_path}"
                                media_item['file'] = full_url
                                # Also set the URL fields that frontend expects
                                media_item['file_url'] = full_url
                                media_item['image_url'] = full_url
                                if 'url' not in media_item:
                                    media_item['url'] = full_url
                
                # Also fix images array if it exists
                if 'images' in report and report['images']:
                    fixed_images = []
                    for img_path in report['images']:
                        if img_path and not img_path.startswith('http'):
                            fixed_images.append(f"http://localhost:8000/media/{img_path}")
                        else:
                            fixed_images.append(img_path)
                    report['images'] = fixed_images
                
                # Calculate vote counts and percentages
                vote_counts = self._calculate_vote_counts(report)
                vote_percentages = self._calculate_vote_percentages(vote_counts)
                report['vote_counts'] = vote_counts
                report['vote_percentages'] = vote_percentages
            
            return reports
        except Exception as e:
            print(f"Error getting reports from MongoDB: {e}")
            return []
    
    def get_report_by_id(self, report_id: str) -> Optional[Dict]:
        """Get a single report by ID (supports both MongoDB ObjectId and report_id)"""
        try:
            if not self.db:
                return None
            
            collection = self.db['emergency_reports']
            
            # Try to find by MongoDB ObjectId first, then by report_id
            from bson import ObjectId
            try:
                # Try as MongoDB ObjectId
                object_id = ObjectId(report_id)
                report = collection.find_one({'_id': object_id})
            except:
                # If not a valid ObjectId, try as report_id
                report = collection.find_one({'report_id': report_id})
            
            if report:
                if '_id' in report:
                    report['id'] = str(report['_id'])
                    del report['_id']
                
                # Format dates
                if 'created_at' in report and isinstance(report['created_at'], datetime):
                    report['created_at'] = report['created_at'].isoformat()
                
                if 'updated_at' in report and isinstance(report['updated_at'], datetime):
                    report['updated_at'] = report['updated_at'].isoformat()
                
                # Fix image URLs - handle both Cloudinary and local storage
                if 'media' in report and report['media']:
                    for media_item in report['media']:
                        # Check if it's already a Cloudinary URL
                        if 'url' in media_item and media_item['url'] and media_item['url'].startswith('http'):
                            # Cloudinary URL - use as is
                            media_item['file_url'] = media_item['url']
                            media_item['image_url'] = media_item['url']
                            if 'file' not in media_item:
                                media_item['file'] = media_item['url']
                        elif 'file' in media_item and media_item['file']:
                            # Local file - convert to full URL
                            file_path = media_item['file']
                            if not file_path.startswith('http'):
                                full_url = f"http://localhost:8000/media/{file_path}"
                                media_item['file'] = full_url
                                # Also set the URL fields that frontend expects
                                media_item['file_url'] = full_url
                                media_item['image_url'] = full_url
                                if 'url' not in media_item:
                                    media_item['url'] = full_url
                
                # Also fix images array if it exists
                if 'images' in report and report['images']:
                    fixed_images = []
                    for img_path in report['images']:
                        if img_path and not img_path.startswith('http'):
                            fixed_images.append(f"http://localhost:8000/media/{img_path}")
                        else:
                            fixed_images.append(img_path)
                    report['images'] = fixed_images
                
                # Calculate vote counts
                report['vote_counts'] = self._calculate_vote_counts(report)
                report['vote_percentages'] = self._calculate_vote_percentages(report['vote_counts'])
            
            return report
        except Exception as e:
            print(f"Error getting report by ID from MongoDB: {e}")
            return None
    
    def create_report(self, report_data: Dict) -> Optional[Dict]:
        """Create a new report in MongoDB"""
        try:
            if not self.db:
                return None
            
            collection = self.db['emergency_reports']
            
            # Add timestamps
            now = datetime.utcnow()
            report_data['created_at'] = now
            report_data['updated_at'] = now
            
            # Insert the report
            result = collection.insert_one(report_data)
            
            if result.inserted_id:
                # Return the created report
                report_data['id'] = str(result.inserted_id)
                report_data['created_at'] = now.isoformat()
                report_data['updated_at'] = now.isoformat()
                
                # Convert any remaining ObjectId fields to strings
                self._convert_objectids_to_strings(report_data)
                
                return report_data
            
            return None
        except Exception as e:
            print(f"Error creating report in MongoDB: {e}")
            return None
    
    def update_report(self, report_id: str, update_data: Dict) -> Optional[Dict]:
        """Update a report in MongoDB (supports both MongoDB ObjectId and report_id)"""
        try:
            if not self.db:
                return None
            
            collection = self.db['emergency_reports']
            
            # Add updated timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            # Try to find by MongoDB ObjectId first, then by report_id
            from bson import ObjectId
            try:
                # Try as MongoDB ObjectId
                object_id = ObjectId(report_id)
                query = {'_id': object_id}
            except:
                # If not a valid ObjectId, try as report_id
                query = {'report_id': report_id}
            
            # Update the report
            result = collection.update_one(
                query,
                {'$set': update_data}
            )
            
            if result.modified_count > 0:
                # Return the updated report
                return self.get_report_by_id(report_id)
            
            return None
        except Exception as e:
            print(f"Error updating report in MongoDB: {e}")
            return None
    
    def delete_report(self, report_id: str) -> bool:
        """Delete a report from MongoDB (supports both MongoDB ObjectId and report_id)"""
        try:
            if not self.db:
                return False
            
            collection = self.db['emergency_reports']
            
            # Try to delete by MongoDB ObjectId first, then by report_id
            from bson import ObjectId
            try:
                # Try as MongoDB ObjectId
                object_id = ObjectId(report_id)
                result = collection.delete_one({'_id': object_id})
            except:
                # If not a valid ObjectId, try as report_id
                result = collection.delete_one({'report_id': report_id})
            
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting report from MongoDB: {e}")
            return False
    
    def get_nearby_reports(self, lat: float, lng: float, radius_km: float = 10) -> List[Dict]:
        """Get reports within a radius using geospatial query"""
        try:
            if not self.db:
                return []
            
            collection = self.db['emergency_reports']
            
            # MongoDB geospatial query
            query = {
                'location': {
                    '$geoWithin': {
                        '$centerSphere': [
                            [lng, lat],  # Note: MongoDB uses [longitude, latitude]
                            radius_km / 6378.1  # Convert km to radians (Earth radius in km)
                        ]
                    }
                },
                'status': {'$in': ['PENDING', 'VERIFIED', 'IN_PROGRESS']}
            }
            
            cursor = collection.find(query).sort('created_at', -1)
            reports = list(cursor)
            
            # Convert ObjectId to string and format dates
            for report in reports:
                if '_id' in report:
                    report['id'] = str(report['_id'])
                    del report['_id']
                
                if 'created_at' in report and isinstance(report['created_at'], datetime):
                    report['created_at'] = report['created_at'].isoformat()
                
                if 'updated_at' in report and isinstance(report['updated_at'], datetime):
                    report['updated_at'] = report['updated_at'].isoformat()
                
                # Fix image URLs - handle both Cloudinary and local storage
                if 'media' in report and report['media']:
                    for media_item in report['media']:
                        # Check if it's already a Cloudinary URL
                        if 'url' in media_item and media_item['url'] and media_item['url'].startswith('http'):
                            # Cloudinary URL - use as is
                            media_item['file_url'] = media_item['url']
                            media_item['image_url'] = media_item['url']
                            if 'file' not in media_item:
                                media_item['file'] = media_item['url']
                        elif 'file' in media_item and media_item['file']:
                            # Local file - convert to full URL
                            file_path = media_item['file']
                            if not file_path.startswith('http'):
                                full_url = f"http://localhost:8000/media/{file_path}"
                                media_item['file'] = full_url
                                # Also set the URL fields that frontend expects
                                media_item['file_url'] = full_url
                                media_item['image_url'] = full_url
                                if 'url' not in media_item:
                                    media_item['url'] = full_url
                
                # Also fix images array if it exists
                if 'images' in report and report['images']:
                    fixed_images = []
                    for img_path in report['images']:
                        if img_path and not img_path.startswith('http'):
                            fixed_images.append(f"http://localhost:8000/media/{img_path}")
                        else:
                            fixed_images.append(img_path)
                    report['images'] = fixed_images
            
            return reports
        except Exception as e:
            print(f"Error getting nearby reports from MongoDB: {e}")
            return []
    
    def get_dashboard_stats(self, user_id: Optional[int] = None) -> Dict:
        """Get dashboard statistics from MongoDB"""
        try:
            if not self.db:
                return {}
            
            collection = self.db['emergency_reports']
            
            # Build query
            query = {}
            if user_id:
                query['user_id'] = user_id
            
            # Get counts
            total_reports = collection.count_documents(query)
            pending_reports = collection.count_documents({**query, 'status': 'PENDING'})
            active_reports = collection.count_documents({**query, 'status': {'$in': ['VERIFIED', 'IN_PROGRESS']}})
            resolved_reports = collection.count_documents({**query, 'status': 'RESOLVED'})
            critical_reports = collection.count_documents({**query, 'priority': 'CRITICAL'})
            
            # Get disaster type breakdown
            disaster_pipeline = [
                {'$match': query},
                {'$group': {'_id': '$disaster_type', 'count': {'$sum': 1}}}
            ]
            disaster_breakdown = list(collection.aggregate(disaster_pipeline))
            by_disaster_type = {item['_id']: item['count'] for item in disaster_breakdown if item['_id']}
            
            # Get priority breakdown
            priority_pipeline = [
                {'$match': query},
                {'$group': {'_id': '$priority', 'count': {'$sum': 1}}}
            ]
            priority_breakdown = list(collection.aggregate(priority_pipeline))
            by_priority = {item['_id']: item['count'] for item in priority_breakdown if item['_id']}
            
            return {
                'total_reports': total_reports,
                'pending_reports': pending_reports,
                'active_reports': active_reports,
                'resolved_reports': resolved_reports,
                'critical_reports': critical_reports,
                'by_disaster_type': by_disaster_type,
                'by_priority': by_priority
            }
        except Exception as e:
            print(f"Error getting dashboard stats from MongoDB: {e}")
            return {}
    
    def add_comment(self, report_id: str, comment_data: Dict) -> Optional[Dict]:
        """Add a comment/update to a report (supports both MongoDB ObjectId and report_id)"""
        try:
            if not self.db:
                return None
            
            collection = self.db['emergency_reports']
            
            # Add timestamp and unique ID to comment
            comment_data['created_at'] = timezone.now().isoformat()
            comment_data['id'] = str(uuid.uuid4())  # Add unique comment ID
            comment_data['_id'] = comment_data['id']  # For MongoDB compatibility
            
            # Try to find by MongoDB ObjectId first, then by report_id
            from bson import ObjectId
            try:
                # Try as MongoDB ObjectId
                object_id = ObjectId(report_id)
                query = {'_id': object_id}
            except:
                # If not a valid ObjectId, try as report_id
                query = {'report_id': report_id}
            
            # Add comment to the updates array
            result = collection.update_one(
                query,
                {'$push': {'updates': comment_data}}
            )
            
            if result.modified_count > 0:
                return comment_data
            
            return None
        except Exception as e:
            print(f"Error adding comment to report in MongoDB: {e}")
            return None
    
    def delete_comment(self, report_id: str, comment_index: int) -> bool:
        """Delete a comment from a report"""
        try:
            if not self.db:
                return False
            
            collection = self.db['emergency_reports']
            
            # Remove comment from the updates array by index
            result = collection.update_one(
                {'report_id': report_id},
                {'$unset': {f'updates.{comment_index}': 1}}
            )
            
            if result.modified_count > 0:
                # Clean up the array (remove null values)
                collection.update_one(
                    {'report_id': report_id},
                    {'$pull': {'updates': None}}
                )
                return True
            
            return False
        except Exception as e:
            print(f"Error deleting comment from report in MongoDB: {e}")
            return False
    
    def delete_comment_by_id(self, report_id: str, comment_id: str) -> bool:
        """Delete a comment from a report by comment ID (supports both MongoDB ObjectId and report_id)"""
        try:
            if not self.db:
                return False
            
            collection = self.db['emergency_reports']
            
            # Try to find by MongoDB ObjectId first, then by report_id
            from bson import ObjectId
            try:
                # Try as MongoDB ObjectId
                object_id = ObjectId(report_id)
                query = {'_id': object_id}
            except:
                # If not a valid ObjectId, try as report_id
                query = {'report_id': report_id}
            
            # Get the report to find the comment index
            report = collection.find_one(query)
            if not report:
                return False
            
            # Find the comment index by matching comment_id
            comment_index = None
            for i, comment in enumerate(report.get('updates', [])):
                # Check both _id and id fields, and also check if comment_id matches any identifier
                if (str(comment.get('_id', '')) == str(comment_id) or 
                    str(comment.get('id', '')) == str(comment_id) or
                    str(comment.get('user_id', '')) == str(comment_id) or
                    comment.get('message', '') == str(comment_id)):
                    comment_index = i
                    break
            
            if comment_index is None:
                return False
            
            # Remove comment from the updates array by index
            result = collection.update_one(
                query,
                {'$unset': {f'updates.{comment_index}': 1}}
            )
            
            if result.modified_count > 0:
                # Clean up the array (remove null values)
                collection.update_one(
                    query,
                    {'$pull': {'updates': None}}
                )
                return True
            
            return False
        except Exception as e:
            print(f"Error deleting comment by ID from report in MongoDB: {e}")
            return False
    
    def add_vote(self, report_id: str, vote_data: Dict) -> Optional[Dict]:
        """Add or update a vote for a report with automatic status change logic"""
        try:
            if not self.db:
                return None
            
            collection = self.db['emergency_reports']
            
            # Get the report first
            report = collection.find_one({'report_id': report_id})
            if not report:
                return None
            
            # Add timestamp to vote
            vote_data['created_at'] = timezone.now().isoformat()
            
            # Check if this is the report owner voting
            is_owner_vote = report.get('user_id') == vote_data.get('user_id')
            
            # Initialize votes array if it doesn't exist
            if 'votes' not in report:
                report['votes'] = []
            
            # Check if user already voted (one vote per user)
            user_id = vote_data.get('user_id')
            existing_vote_index = None
            
            for i, vote in enumerate(report.get('votes', [])):
                if vote.get('user_id') == user_id:
                    existing_vote_index = i
                    break
            
            # Update or add vote
            if existing_vote_index is not None:
                # Update existing vote
                report['votes'][existing_vote_index] = vote_data
            else:
                # Add new vote
                report['votes'].append(vote_data)
            
            # Update the report with new votes
            result = collection.update_one(
                {'report_id': report_id},
                {
                    '$set': {
                        'votes': report['votes'],
                        'user_vote': vote_data,  # Keep for backward compatibility
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Apply automatic status change logic
                self._apply_status_change_logic(report_id, vote_data, is_owner_vote, report['votes'])
                return vote_data
            
            return None
        except Exception as e:
            print(f"Error adding vote to report in MongoDB: {e}")
            return None
    
    def _apply_status_change_logic(self, report_id: str, vote_data: Dict, is_owner_vote: bool, all_votes: list):
        """Apply automatic status change logic based on voting rules"""
        try:
            if not self.db:
                return
            
            collection = self.db['emergency_reports']
            
            # Rule 1: If report owner votes "RESOLVED", automatically change status to RESOLVED
            if is_owner_vote and vote_data.get('vote_type') == 'RESOLVED':
                collection.update_one(
                    {'report_id': report_id},
                    {'$set': {'status': 'RESOLVED', 'updated_at': datetime.utcnow()}}
                )
                print(f"Status automatically changed to RESOLVED by report owner for report {report_id}")
                return
            
            # Rule 2: For community votes, implement 60% criteria
            if not is_owner_vote and len(all_votes) >= 3:  # Need at least 3 votes for 60% rule
                # Calculate vote counts
                vote_counts = {'STILL_THERE': 0, 'RESOLVED': 0, 'FAKE_REPORT': 0}
                total_votes = len(all_votes)
                
                for vote in all_votes:
                    vote_type = vote.get('vote_type')
                    if vote_type in vote_counts:
                        vote_counts[vote_type] += 1
                
                # Check 60% criteria
                resolved_percentage = (vote_counts['RESOLVED'] / total_votes) * 100
                fake_percentage = (vote_counts['FAKE_REPORT'] / total_votes) * 100
                
                if resolved_percentage >= 60:
                    collection.update_one(
                        {'report_id': report_id},
                        {'$set': {'status': 'RESOLVED', 'updated_at': datetime.utcnow()}}
                    )
                    print(f"Status automatically changed to RESOLVED by community vote (60%+ resolved) for report {report_id}")
                elif fake_percentage >= 60:
                    collection.update_one(
                        {'report_id': report_id},
                        {'$set': {'status': 'REJECTED', 'updated_at': datetime.utcnow()}}
                    )
                    print(f"Status automatically changed to REJECTED by community vote (60%+ fake) for report {report_id}")
            
        except Exception as e:
            print(f"Error applying status change logic: {e}")
    
    def _calculate_vote_counts(self, report: Dict) -> Dict:
        """Calculate vote counts for a report"""
        try:
            vote_counts = {
                'still_there': 0,
                'resolved': 0,
                'fake_report': 0,
                'total': 0
            }
            
            # Check if report has votes array (new system)
            if 'votes' in report and report['votes']:
                for vote in report['votes']:
                    vote_type = vote.get('vote_type', '')
                    if vote_type == 'STILL_THERE':
                        vote_counts['still_there'] += 1
                    elif vote_type == 'RESOLVED':
                        vote_counts['resolved'] += 1
                    elif vote_type == 'FAKE_REPORT':
                        vote_counts['fake_report'] += 1
                
                vote_counts['total'] = len(report['votes'])
            # Fallback to old system for backward compatibility
            elif 'user_vote' in report and report['user_vote']:
                vote_type = report['user_vote'].get('vote_type', '')
                if vote_type == 'STILL_THERE':
                    vote_counts['still_there'] = 1
                elif vote_type == 'RESOLVED':
                    vote_counts['resolved'] = 1
                elif vote_type == 'FAKE_REPORT':
                    vote_counts['fake_report'] = 1
                
                vote_counts['total'] = 1
            
            return vote_counts
        except Exception as e:
            print(f"Error calculating vote counts: {e}")
            return {'still_there': 0, 'resolved': 0, 'fake_report': 0, 'total': 0}
    
    def _calculate_vote_percentages(self, vote_counts: Dict) -> Dict:
        """Calculate vote percentages from vote counts"""
        try:
            total = vote_counts.get('total', 0)
            if total == 0:
                return {'still_there': 0, 'resolved': 0, 'fake_report': 0}
            
            return {
                'still_there': round((vote_counts.get('still_there', 0) / total) * 100, 1),
                'resolved': round((vote_counts.get('resolved', 0) / total) * 100, 1),
                'fake_report': round((vote_counts.get('fake_report', 0) / total) * 100, 1)
            }
        except Exception as e:
            print(f"Error calculating vote percentages: {e}")
            return {'still_there': 0, 'resolved': 0, 'fake_report': 0}

    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()

# Global instance
mongodb_service = SOSReportMongoDBService()
