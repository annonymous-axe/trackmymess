#!/usr/bin/env python3
"""
Additional validation tests for edge cases
"""

import requests
import json

BACKEND_URL = "https://messmanager-1.preview.emergentagent.com/api"

def test_nonexistent_tenant_update():
    """Test updating a non-existent tenant"""
    print("=== Testing Update Non-existent Tenant ===")
    
    # Login first
    login_data = {"username": "superadmin", "password": "Admin@123"}
    response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print("❌ Login failed")
        return False
    
    access_token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Try to update non-existent tenant
    fake_tenant_id = "00000000-0000-0000-0000-000000000000"
    update_data = {"mess_name": "Updated Name"}
    
    response = requests.put(
        f"{BACKEND_URL}/super-admin/tenants/{fake_tenant_id}",
        json=update_data,
        headers=headers
    )
    
    if response.status_code == 404:
        data = response.json()
        if "not found" in data.get("detail", "").lower():
            print("✅ PASS: Non-existent tenant returns proper 404")
            return True
    
    print(f"❌ FAIL: Expected 404, got {response.status_code}: {response.text}")
    return False

def test_error_structure():
    """Test that validation errors have proper FastAPI structure"""
    print("=== Testing Error Structure ===")
    
    # Login first
    login_data = {"username": "superadmin", "password": "Admin@123"}
    response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print("❌ Login failed")
        return False
    
    access_token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Get existing tenant
    response = requests.get(f"{BACKEND_URL}/super-admin/tenants", headers=headers)
    if response.status_code != 200 or not response.json():
        print("❌ No tenants found")
        return False
    
    tenant_id = response.json()[0]["id"]
    
    # Test with invalid mobile to check error structure
    update_data = {"mobile": "invalid"}
    
    response = requests.put(
        f"{BACKEND_URL}/super-admin/tenants/{tenant_id}",
        json=update_data,
        headers=headers
    )
    
    if response.status_code == 422:
        data = response.json()
        if ("detail" in data and 
            isinstance(data["detail"], list) and 
            len(data["detail"]) > 0):
            
            error = data["detail"][0]
            if (isinstance(error, dict) and 
                "loc" in error and 
                "msg" in error and 
                "type" in error):
                print("✅ PASS: Error structure has proper FastAPI format with 'loc', 'msg', 'type'")
                return True
    
    print(f"❌ FAIL: Unexpected error structure: {response.text}")
    return False

if __name__ == "__main__":
    print("🔍 Additional Validation Tests")
    print("=" * 40)
    
    test_nonexistent_tenant_update()
    test_error_structure()