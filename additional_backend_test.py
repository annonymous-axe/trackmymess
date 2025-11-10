#!/usr/bin/env python3
"""
Additional Backend API Testing for edge cases and error format verification
"""

import requests
import json

# Get backend URL from frontend .env
BACKEND_URL = "https://messmanager-1.preview.emergentagent.com/api"

class AdditionalTests:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.access_token = None
        
    def login(self):
        """Login as super admin"""
        login_data = {
            "username": "superadmin",
            "password": "Admin@123"
        }
        
        response = requests.post(f"{self.base_url}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get("access_token")
            return True
        return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if not self.access_token:
            return {}
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def test_error_format_structure(self):
        """Test that validation errors have proper FastAPI structure"""
        print("\n=== Testing Error Format Structure ===")
        
        # Send completely invalid data to trigger multiple validation errors
        invalid_data = {
            "mess_name": "",  # Empty string
            "owner_name": "",
            "email": "not-an-email",
            "mobile": "abc",  # Invalid mobile
            "address": "",
            "capacity": "not-a-number",  # Invalid type
            "subscription_plan": "INVALID_PLAN",
            "username": "ab",  # Too short
            "password": "123"  # Too short
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/super-admin/tenants",
                json=invalid_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                data = response.json()
                print(f"✅ Got 422 status code")
                print(f"Response structure: {json.dumps(data, indent=2)}")
                
                # Verify FastAPI error structure
                if "detail" in data and isinstance(data["detail"], list):
                    print(f"✅ Has 'detail' array with {len(data['detail'])} errors")
                    
                    # Check each error has required fields
                    for i, error in enumerate(data["detail"]):
                        if isinstance(error, dict):
                            required_fields = ["loc", "msg", "type"]
                            has_all_fields = all(field in error for field in required_fields)
                            print(f"  Error {i+1}: {has_all_fields} - {error}")
                        else:
                            print(f"  Error {i+1}: Not a dict - {error}")
                    
                    return True
                else:
                    print(f"❌ Invalid error structure: {data}")
                    return False
            else:
                print(f"❌ Expected 422, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False
    
    def test_password_validation(self):
        """Test password validation (should be at least 8 characters based on review request)"""
        print("\n=== Testing Password Validation ===")
        
        client_data = {
            "mess_name": "Password Test Mess",
            "owner_name": "Password Test User",
            "email": "password.test@testmess.com",
            "mobile": "9876543215",
            "address": "333 Test Street, Test City",
            "capacity": 100,
            "subscription_plan": "BASIC",
            "username": "passtest123",
            "password": "123"  # Too short - less than 8 characters
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/super-admin/tenants",
                json=client_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                data = response.json()
                if "detail" in data and isinstance(data["detail"], list):
                    errors = data["detail"]
                    password_error = any(
                        err.get("loc", [])[-1] == "password" and "8" in str(err.get("msg", ""))
                        for err in errors if isinstance(err, dict)
                    )
                    if password_error:
                        print("✅ Password validation working correctly")
                        return True
                    else:
                        print(f"❌ No password validation found in errors: {errors}")
                        return False
                else:
                    print(f"❌ Unexpected error format: {data}")
                    return False
            else:
                print(f"❌ Expected 422, got {response.status_code}: {response.text}")
                # If it succeeded, password validation might be missing
                if response.status_code in [200, 201]:
                    print("❌ Short password was accepted - validation missing")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False
    
    def test_authentication_required(self):
        """Test that endpoints require authentication"""
        print("\n=== Testing Authentication Required ===")
        
        # Try to access endpoint without token
        response = requests.get(f"{self.base_url}/super-admin/tenants")
        
        if response.status_code == 403:
            print("✅ Authentication required (403 Forbidden)")
            return True
        elif response.status_code == 401:
            print("✅ Authentication required (401 Unauthorized)")
            return True
        else:
            print(f"❌ Expected 401/403, got {response.status_code}: {response.text}")
            return False
    
    def test_non_existent_tenant_update(self):
        """Test updating non-existent tenant"""
        print("\n=== Testing Non-existent Tenant Update ===")
        
        fake_id = "non-existent-tenant-id"
        update_data = {"mess_name": "Updated Name"}
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{fake_id}",
                json=update_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 404:
                print("✅ Proper 404 for non-existent tenant")
                return True
            else:
                print(f"❌ Expected 404, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False
    
    def run_additional_tests(self):
        """Run all additional tests"""
        print("🔍 Running Additional Backend Tests")
        print("=" * 50)
        
        if not self.login():
            print("❌ Login failed")
            return
        
        self.test_error_format_structure()
        self.test_password_validation()
        self.test_authentication_required()
        self.test_non_existent_tenant_update()
        
        print("\n✅ Additional tests completed")

if __name__ == "__main__":
    tester = AdditionalTests()
    tester.run_additional_tests()