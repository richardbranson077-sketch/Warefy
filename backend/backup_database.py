#!/usr/bin/env python3
"""
Automated Database Backup Script
Supports PostgreSQL and SQLite with rotation policy
"""

import os
import sys
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
import shutil
import logging

# Configuration
BACKUP_DIR = os.getenv("BACKUP_DIR", "./backups")
DATABASE_URL = os.getenv("DATABASE_URL")
BACKUP_RETENTION_DAYS = int(os.getenv("BACKUP_RETENTION_DAYS", "30"))
MAX_BACKUPS = int(os.getenv("MAX_BACKUPS", "10"))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_backup_dir():
    """Create backup directory if it doesn't exist"""
    Path(BACKUP_DIR).mkdir(parents=True, exist_ok=True)
    logger.info(f"Backup directory: {BACKUP_DIR}")


def backup_postgresql(database_url: str) -> str:
    """
    Backup PostgreSQL database using pg_dump
    
    Args:
        database_url: PostgreSQL connection URL
        
    Returns:
        Path to backup file
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"warefy_backup_{timestamp}.sql")
    
    logger.info(f"Starting PostgreSQL backup to {backup_file}")
    
    try:
        # Use pg_dump to create backup
        subprocess.run(
            ["pg_dump", database_url, "-f", backup_file],
            check=True,
            capture_output=True,
            text=True
        )
        
        # Compress backup
        compressed_file = f"{backup_file}.gz"
        subprocess.run(
            ["gzip", backup_file],
            check=True
        )
        
        logger.info(f"✅ PostgreSQL backup completed: {compressed_file}")
        return compressed_file
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ PostgreSQL backup failed: {e.stderr}")
        raise
    except FileNotFoundError:
        logger.error("❌ pg_dump not found. Install PostgreSQL client tools.")
        raise


def backup_sqlite(db_path: str) -> str:
    """
    Backup SQLite database
    
    Args:
        db_path: Path to SQLite database file
        
    Returns:
        Path to backup file
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"warefy_backup_{timestamp}.db")
    
    logger.info(f"Starting SQLite backup to {backup_file}")
    
    try:
        # Copy database file
        shutil.copy2(db_path, backup_file)
        
        # Compress backup
        compressed_file = f"{backup_file}.gz"
        subprocess.run(
            ["gzip", backup_file],
            check=True
        )
        
        logger.info(f"✅ SQLite backup completed: {compressed_file}")
        return compressed_file
        
    except Exception as e:
        logger.error(f"❌ SQLite backup failed: {e}")
        raise


def verify_backup(backup_file: str) -> bool:
    """
    Verify backup file exists and is not empty
    
    Args:
        backup_file: Path to backup file
        
    Returns:
        True if backup is valid
    """
    if not os.path.exists(backup_file):
        logger.error(f"❌ Backup file not found: {backup_file}")
        return False
    
    file_size = os.path.getsize(backup_file)
    if file_size == 0:
        logger.error(f"❌ Backup file is empty: {backup_file}")
        return False
    
    logger.info(f"✅ Backup verified: {backup_file} ({file_size / 1024 / 1024:.2f} MB)")
    return True


def rotate_backups():
    """
    Remove old backups based on retention policy
    """
    logger.info("Starting backup rotation")
    
    # Get all backup files
    backup_files = sorted(
        Path(BACKUP_DIR).glob("warefy_backup_*.gz"),
        key=lambda p: p.stat().st_mtime,
        reverse=True
    )
    
    # Remove backups older than retention period
    cutoff_date = datetime.now() - timedelta(days=BACKUP_RETENTION_DAYS)
    removed_count = 0
    
    for backup_file in backup_files:
        file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
        
        # Keep only MAX_BACKUPS most recent
        if len(backup_files) - removed_count > MAX_BACKUPS:
            backup_file.unlink()
            removed_count += 1
            logger.info(f"Removed old backup (max limit): {backup_file.name}")
            continue
        
        # Remove if older than retention period
        if file_time < cutoff_date:
            backup_file.unlink()
            removed_count += 1
            logger.info(f"Removed old backup (expired): {backup_file.name}")
    
    logger.info(f"✅ Backup rotation completed. Removed {removed_count} old backups")


def main():
    """Main backup function"""
    logger.info("=" * 60)
    logger.info("Starting Warefy Database Backup")
    logger.info("=" * 60)
    
    try:
        # Create backup directory
        create_backup_dir()
        
        # Determine database type and backup
        if DATABASE_URL:
            if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
                backup_file = backup_postgresql(DATABASE_URL)
            else:
                logger.error(f"❌ Unsupported database URL: {DATABASE_URL}")
                sys.exit(1)
        else:
            # Default to SQLite
            db_path = os.path.join(os.path.dirname(__file__), "warefy.db")
            if not os.path.exists(db_path):
                logger.error(f"❌ SQLite database not found: {db_path}")
                sys.exit(1)
            backup_file = backup_sqlite(db_path)
        
        # Verify backup
        if not verify_backup(backup_file):
            logger.error("❌ Backup verification failed")
            sys.exit(1)
        
        # Rotate old backups
        rotate_backups()
        
        logger.info("=" * 60)
        logger.info("✅ Backup completed successfully")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Backup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
