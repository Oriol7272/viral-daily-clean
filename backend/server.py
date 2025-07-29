from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import aiohttp
import asyncio
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Viral Daily API", description="API for aggregating viral videos from multiple platforms")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class Platform(str, Enum):
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    TWITTER = "twitter"
    INSTAGRAM = "instagram"

class DeliveryMethod(str, Enum):
    EMAIL = "email"
    TELEGRAM = "telegram"
    WHATSAPP = "whatsapp"

# Data Models
class ViralVideo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    url: str
    thumbnail: str
    platform: Platform
    views: Optional[int] = None
    likes: Optional[int] = None
    shares: Optional[int] = None
    author: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    viral_score: float = 0.0  # Custom scoring algorithm
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None

class VideoResponse(BaseModel):
    videos: List[ViralVideo]
    total: int
    platform: Optional[Platform] = None
    date: datetime

class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[EmailStr] = None
    telegram_id: Optional[str] = None
    whatsapp_number: Optional[str] = None
    delivery_methods: List[DeliveryMethod]
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_delivery: Optional[datetime] = None

class SubscriptionCreate(BaseModel):
    email: Optional[EmailStr] = None
    telegram_id: Optional[str] = None
    whatsapp_number: Optional[str] = None
    delivery_methods: List[DeliveryMethod]

# Video Aggregation Service
class VideoAggregator:
    def __init__(self):
        self.youtube_api_key = os.getenv('YOUTUBE_API_KEY')
        self.twitter_bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        
    async def fetch_youtube_viral_videos(self, limit: int = 10) -> List[ViralVideo]:
        """Fetch viral videos from YouTube"""
        videos = []
        
        if not self.youtube_api_key:
            # Return mock data for now
            for i in range(limit):
                video = ViralVideo(
                    title=f"YouTube Viral Video {i+1}",
                    url=f"https://www.youtube.com/watch?v=mock{i+1}",
                    thumbnail=f"https://img.youtube.com/vi/mock{i+1}/maxresdefault.jpg",
                    platform=Platform.YOUTUBE,
                    views=1000000 + i * 100000,
                    likes=50000 + i * 5000,
                    author=f"Creator {i+1}",
                    viral_score=90.0 - i * 2,
                    published_at=datetime.utcnow() - timedelta(hours=i)
                )
                videos.append(video)
        else:
            # TODO: Implement actual YouTube API integration
            pass
            
        return videos

    async def fetch_tiktok_viral_videos(self, limit: int = 10) -> List[ViralVideo]:
        """Fetch viral videos from TikTok"""
        videos = []
        
        # Mock data for now
        for i in range(limit):
            video = ViralVideo(
                title=f"TikTok Viral Video {i+1}",
                url=f"https://www.tiktok.com/@user/video/mock{i+1}",
                thumbnail=f"https://via.placeholder.com/300x400/FF0050/FFFFFF?text=TikTok+{i+1}",
                platform=Platform.TIKTOK,
                views=5000000 + i * 200000,
                likes=250000 + i * 10000,
                author=f"@tiktoker{i+1}",
                viral_score=85.0 - i * 1.5,
                published_at=datetime.utcnow() - timedelta(hours=i * 2)
            )
            videos.append(video)
            
        return videos

    async def fetch_twitter_viral_videos(self, limit: int = 10) -> List[ViralVideo]:
        """Fetch viral videos from Twitter/X"""
        videos = []
        
        # Mock data for now
        for i in range(limit):
            video = ViralVideo(
                title=f"Twitter Viral Video {i+1}",
                url=f"https://twitter.com/user/status/mock{i+1}",
                thumbnail=f"https://via.placeholder.com/400x225/1DA1F2/FFFFFF?text=Twitter+{i+1}",
                platform=Platform.TWITTER,
                views=2000000 + i * 150000,
                likes=100000 + i * 8000,
                shares=25000 + i * 2000,
                author=f"@twitteruser{i+1}",
                viral_score=80.0 - i * 1.8,
                published_at=datetime.utcnow() - timedelta(hours=i * 3)
            )
            videos.append(video)
            
        return videos

    async def fetch_instagram_viral_videos(self, limit: int = 10) -> List[ViralVideo]:
        """Fetch viral videos from Instagram"""
        videos = []
        
        # Mock data for now
        for i in range(limit):
            video = ViralVideo(
                title=f"Instagram Viral Reel {i+1}",
                url=f"https://www.instagram.com/reel/mock{i+1}",
                thumbnail=f"https://via.placeholder.com/300x300/E4405F/FFFFFF?text=IG+{i+1}",
                platform=Platform.INSTAGRAM,
                views=3000000 + i * 180000,
                likes=180000 + i * 9000,
                author=f"@instagrammer{i+1}",
                viral_score=88.0 - i * 2.2,
                published_at=datetime.utcnow() - timedelta(hours=i * 1.5)
            )
            videos.append(video)
            
        return videos

    async def get_aggregated_viral_videos(self, limit: int = 40) -> List[ViralVideo]:
        """Get viral videos from all platforms and sort by viral score"""
        all_videos = []
        
        # Fetch from all platforms concurrently
        tasks = [
            self.fetch_youtube_viral_videos(limit // 4),
            self.fetch_tiktok_viral_videos(limit // 4),
            self.fetch_twitter_viral_videos(limit // 4),
            self.fetch_instagram_viral_videos(limit // 4)
        ]
        
        results = await asyncio.gather(*tasks)
        
        for video_list in results:
            all_videos.extend(video_list)
        
        # Sort by viral score and return top videos
        all_videos.sort(key=lambda x: x.viral_score, reverse=True)
        return all_videos[:limit]

# Initialize aggregator
aggregator = VideoAggregator()

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Viral Daily API - Aggregating the most viral content from across the web!"}

@api_router.get("/videos", response_model=VideoResponse)
async def get_viral_videos(platform: Optional[Platform] = None, limit: int = 10):
    """Get viral videos from all platforms or a specific platform"""
    try:
        if platform:
            # Get videos from specific platform
            if platform == Platform.YOUTUBE:
                videos = await aggregator.fetch_youtube_viral_videos(limit)
            elif platform == Platform.TIKTOK:
                videos = await aggregator.fetch_tiktok_viral_videos(limit)
            elif platform == Platform.TWITTER:
                videos = await aggregator.fetch_twitter_viral_videos(limit)
            elif platform == Platform.INSTAGRAM:
                videos = await aggregator.fetch_instagram_viral_videos(limit)
            else:
                videos = []
        else:
            # Get aggregated videos from all platforms
            videos = await aggregator.get_aggregated_viral_videos(limit)
        
        # Store videos in database for future reference
        for video in videos:
            await db.viral_videos.update_one(
                {"url": video.url},
                {"$set": video.dict()},
                upsert=True
            )
        
        return VideoResponse(
            videos=videos,
            total=len(videos),
            platform=platform,
            date=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Error fetching videos: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching viral videos")

@api_router.get("/videos/history")
async def get_video_history(days: int = 7, platform: Optional[Platform] = None):
    """Get historical viral videos from the database"""
    try:
        filter_query = {
            "fetched_at": {
                "$gte": datetime.utcnow() - timedelta(days=days)
            }
        }
        
        if platform:
            filter_query["platform"] = platform.value
        
        videos = await db.viral_videos.find(filter_query).sort("viral_score", -1).to_list(100)
        return {"videos": videos, "total": len(videos)}
    except Exception as e:
        logger.error(f"Error fetching video history: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching video history")

@api_router.post("/subscribe", response_model=Subscription)
async def create_subscription(subscription_data: SubscriptionCreate):
    """Create a new subscription for daily viral video delivery"""
    try:
        subscription = Subscription(**subscription_data.dict())
        await db.subscriptions.insert_one(subscription.dict())
        return subscription
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating subscription")

@api_router.get("/subscriptions")
async def get_subscriptions():
    """Get all active subscriptions"""
    try:
        subscriptions = await db.subscriptions.find({"active": True}).to_list(1000)
        return {"subscriptions": subscriptions, "total": len(subscriptions)}
    except Exception as e:
        logger.error(f"Error fetching subscriptions: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching subscriptions")

@api_router.post("/deliver-daily")
async def deliver_daily_videos(background_tasks: BackgroundTasks):
    """Trigger daily delivery of viral videos to subscribers"""
    try:
        # Get today's top viral videos
        videos = await aggregator.get_aggregated_viral_videos(10)
        
        # Get active subscriptions
        subscriptions = await db.subscriptions.find({"active": True}).to_list(1000)
        
        # Schedule delivery for each subscriber
        for subscription in subscriptions:
            background_tasks.add_task(deliver_to_subscriber, subscription, videos)
        
        return {"message": f"Daily delivery scheduled for {len(subscriptions)} subscribers"}
    except Exception as e:
        logger.error(f"Error scheduling daily delivery: {str(e)}")
        raise HTTPException(status_code=500, detail="Error scheduling daily delivery")

async def deliver_to_subscriber(subscription: dict, videos: List[ViralVideo]):
    """Deliver videos to a specific subscriber"""
    try:
        # TODO: Implement actual delivery logic
        # For now, just log the delivery
        logger.info(f"Delivering {len(videos)} videos to subscriber {subscription['id']}")
        
        # Update last delivery timestamp
        await db.subscriptions.update_one(
            {"id": subscription["id"]},
            {"$set": {"last_delivery": datetime.utcnow()}}
        )
    except Exception as e:
        logger.error(f"Error delivering to subscriber {subscription.get('id')}: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()