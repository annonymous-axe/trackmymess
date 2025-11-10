#!/usr/bin/env python3
"""
Backend API Testing for TrackMyMess Super Admin Client Management
Tests the Super Admin Client Management endpoints thoroughly.
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://messmanager-1.preview.emergentagent.com/api"

class TestSuperAdminClientManagement:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.access_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, details):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if not success or details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    def test_super_admin_login(self):
        """Test Super Admin login endpoint"""
        print("\n=== Testing Super Admin Login ===")
        
        # First try with credentials from review request
        login_data = {
            "username": "superadmin",
            "password": "superadmin123"
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 401:
                # Try with credentials from server.py code
                print("First credentials failed, trying server.py credentials...")
                login_data["password"] = "Admin@123"
                response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                user_role = data.get("user", {}).get("role")
                
                if user_role == "SUPER_ADMIN":
                    self.log_result("Super Admin Login", True, f"Successfully logged in as {user_role}")
                    return True
                else:
                    self.log_result("Super Admin Login", False, f"Wrong role: {user_role}")
                    return False
            else:
                self.log_result("Super Admin Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Super Admin Login", False, f"Exception: {str(e)}")
            return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if not self.access_token:
            return {}
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def test_create_client_valid(self):
        """Test valid client creation"""
        print("\n=== Testing Valid Client Creation ===")
        
        client_data = {
            "mess_name": "Test Mess Hall",
            "owner_name": "John Doe",
            "email": "john.doe@testmess.com",
            "mobile": "9876543210",
            "address": "123 Test Street, Test City",
            "capacity": 100,
            "subscription_plan": "BASIC",
            "username": "testmess123",
            "password": "testpass123"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/super-admin/tenants",
                json=client_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.created_tenant_id = data.get("id")
                self.log_result("Create Valid Client", True, f"Client created with ID: {self.created_tenant_id}")
                return True
            else:
                self.log_result("Create Valid Client", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Valid Client", False, f"Exception: {str(e)}")
            return False
    
    def test_create_client_invalid_email(self):
        """Test client creation with invalid email format"""
        print("\n=== Testing Invalid Email Format ===")
        
        client_data = {
            "mess_name": "Test Mess Hall 2",
            "owner_name": "Jane Doe",
            "email": "invalid-email-format",  # Invalid email
            "mobile": "9876543211",
            "address": "456 Test Street, Test City",
            "capacity": 50,
            "subscription_plan": "BASIC",
            "username": "testmess456",
            "password": "testpass456"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/super-admin/tenants",
                json=client_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                data = response.json()
                # Check if it's FastAPI validation error format
                if "detail" in data and isinstance(data["detail"], list):
                    errors = data["detail"]
                    email_error = any(err.get("loc", [])[-1] == "email" for err in errors if isinstance(err, dict))
                    if email_error:
                        self.log_result("Invalid Email Validation", True, "Proper FastAPI validation error returned")
                        return True
                
                self.log_result("Invalid Email Validation", False, f"Unexpected error format: {data}")
                return False
            else:
                self.log_result("Invalid Email Validation", False, f"Expected 422, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Invalid Email Validation", False, f"Exception: {str(e)}")
            return False
    
    def test_create_client_missing_fields(self):
        """Test client creation with missing required fields"""
        print("\n=== Testing Missing Required Fields ===")
        
        # Missing mess_name and email
        client_data = {
            "owner_name": "Missing Fields Test",
            "mobile": "9876543212",
            "address": "789 Test Street, Test City",
            "capacity": 75,
            "subscription_plan": "BASIC",
            "username": "testmiss789",
            "password": "testpass789"
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
                    missing_fields = [err.get("loc", [])[-1] for err in errors if isinstance(err, dict) and err.get("type") == "missing"]
                    if "mess_name" in missing_fields and "email" in missing_fields:
                        self.log_result("Missing Fields Validation", True, f"Proper validation for missing fields: {missing_fields}")
                        return True
                
                self.log_result("Missing Fields Validation", False, f"Unexpected error format: {data}")
                return False
            else:
                self.log_result("Missing Fields Validation", False, f"Expected 422, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Missing Fields Validation", False, f"Exception: {str(e)}")
            return False
    
    def test_create_client_duplicate_email(self):
        """Test client creation with duplicate email"""
        print("\n=== Testing Duplicate Email ===")
        
        # Use same email as first valid client
        client_data = {
            "mess_name": "Duplicate Email Test",
            "owner_name": "Duplicate User",
            "email": "john.doe@testmess.com",  # Same as first client
            "mobile": "9876543213",
            "address": "999 Test Street, Test City",
            "capacity": 60,
            "subscription_plan": "BASIC",
            "username": "duplicate123",
            "password": "testpass999"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/super-admin/tenants",
                json=client_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 400:
                data = response.json()
                if "detail" in data and "already exists" in data["detail"]:
                    self.log_result("Duplicate Email Validation", True, "Proper duplicate email error returned")
                    return True
                else:
                    self.log_result("Duplicate Email Validation", False, f"Unexpected error message: {data}")
                    return False
            else:
                self.log_result("Duplicate Email Validation", False, f"Expected 400, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Duplicate Email Validation", False, f"Exception: {str(e)}")
            return False
    
    def test_create_client_invalid_mobile(self):
        """Test client creation with invalid mobile number"""
        print("\n=== Testing Invalid Mobile Number ===")
        
        client_data = {
            "mess_name": "Invalid Mobile Test",
            "owner_name": "Invalid Mobile User",
            "email": "invalid.mobile@testmess.com",
            "mobile": "123",  # Invalid - not 10 digits
            "address": "111 Test Street, Test City",
            "capacity": 80,
            "subscription_plan": "BASIC",
            "username": "invmobile123",
            "password": "testpass111"
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
                    mobile_error = any(
                        err.get("loc", [])[-1] == "mobile" and "10 digits" in str(err.get("msg", ""))
                        for err in errors if isinstance(err, dict)
                    )
                    if mobile_error:
                        self.log_result("Invalid Mobile Validation", True, "Proper mobile validation error returned")
                        return True
                
                self.log_result("Invalid Mobile Validation", False, f"Unexpected error format: {data}")
                return False
            else:
                self.log_result("Invalid Mobile Validation", False, f"Expected 422, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Invalid Mobile Validation", False, f"Exception: {str(e)}")
            return False
    
    def test_create_client_short_username(self):
        """Test client creation with short username"""
        print("\n=== Testing Short Username ===")
        
        client_data = {
            "mess_name": "Short Username Test",
            "owner_name": "Short User",
            "email": "short.user@testmess.com",
            "mobile": "9876543214",
            "address": "222 Test Street, Test City",
            "capacity": 90,
            "subscription_plan": "BASIC",
            "username": "abc",  # Too short - less than 6 characters
            "password": "testpass222"
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
                    username_error = any(
                        err.get("loc", [])[-1] == "username" and ("6-20 characters" in str(err.get("msg", "")) or "6" in str(err.get("msg", "")))
                        for err in errors if isinstance(err, dict)
                    )
                    if username_error:
                        self.log_result("Short Username Validation", True, "Proper username length validation error returned")
                        return True
                
                self.log_result("Short Username Validation", False, f"Unexpected error format: {data}")
                return False
            else:
                self.log_result("Short Username Validation", False, f"Expected 422, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Short Username Validation", False, f"Exception: {str(e)}")
            return False
    
    def test_list_clients(self):
        """Test listing all clients"""
        print("\n=== Testing List Clients ===")
        
        try:
            response = requests.get(
                f"{self.base_url}/super-admin/tenants",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("List Clients", True, f"Retrieved {len(data)} clients")
                    return True
                else:
                    self.log_result("List Clients", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("List Clients", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("List Clients", False, f"Exception: {str(e)}")
            return False
    
    def test_update_client_valid(self):
        """Test valid client update"""
        print("\n=== Testing Valid Client Update ===")
        
        if not hasattr(self, 'created_tenant_id') or not self.created_tenant_id:
            self.log_result("Update Valid Client", False, "No tenant ID available for update test")
            return False
        
        update_data = {
            "mess_name": "Updated Test Mess Hall",
            "capacity": 150,
            "mobile": "9876543299"
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{self.created_tenant_id}",
                json=update_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("mess_name") == "Updated Test Mess Hall" and data.get("capacity") == 150:
                    self.log_result("Update Valid Client", True, "Client updated successfully")
                    return True
                else:
                    self.log_result("Update Valid Client", False, f"Update not reflected properly: {data}")
                    return False
            else:
                self.log_result("Update Valid Client", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Valid Client", False, f"Exception: {str(e)}")
            return False
    
    def test_update_client_invalid_mobile(self):
        """Test client update with invalid mobile format"""
        print("\n=== Testing Update with Invalid Mobile ===")
        
        if not hasattr(self, 'created_tenant_id') or not self.created_tenant_id:
            self.log_result("Update Invalid Mobile", False, "No tenant ID available for update test")
            return False
        
        update_data = {
            "mobile": "invalid_mobile"  # Invalid format
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{self.created_tenant_id}",
                json=update_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                data = response.json()
                if "detail" in data and isinstance(data["detail"], list):
                    errors = data["detail"]
                    mobile_error = any(
                        err.get("loc", [])[-1] == "mobile"
                        for err in errors if isinstance(err, dict)
                    )
                    if mobile_error:
                        self.log_result("Update Invalid Mobile", True, "Proper mobile validation error on update")
                        return True
                
                self.log_result("Update Invalid Mobile", False, f"Unexpected error format: {data}")
                return False
            else:
                self.log_result("Update Invalid Mobile", False, f"Expected 422, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Invalid Mobile", False, f"Exception: {str(e)}")
            return False
    
    def test_update_client_invalid_capacity(self):
        """Test client update with invalid capacity"""
        print("\n=== Testing Update with Invalid Capacity ===")
        
        if not hasattr(self, 'created_tenant_id') or not self.created_tenant_id:
            self.log_result("Update Invalid Capacity", False, "No tenant ID available for update test")
            return False
        
        update_data = {
            "capacity": -10  # Negative capacity
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{self.created_tenant_id}",
                json=update_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                data = response.json()
                if "detail" in data and isinstance(data["detail"], list):
                    errors = data["detail"]
                    capacity_error = any(
                        err.get("loc", [])[-1] == "capacity"
                        for err in errors if isinstance(err, dict)
                    )
                    if capacity_error:
                        self.log_result("Update Invalid Capacity", True, "Proper capacity validation error on update")
                        return True
                
                self.log_result("Update Invalid Capacity", False, f"Unexpected error format: {data}")
                return False
            else:
                # If no validation error, check if negative capacity was actually set
                if response.status_code == 200:
                    data = response.json()
                    if data.get("capacity") == -10:
                        self.log_result("Update Invalid Capacity", False, "Negative capacity was accepted - validation missing")
                        return False
                    else:
                        self.log_result("Update Invalid Capacity", True, "Negative capacity was rejected")
                        return True
                
                self.log_result("Update Invalid Capacity", False, f"Unexpected status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Invalid Capacity", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Super Admin Client Management API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Authentication test
        if not self.test_super_admin_login():
            print("\n❌ Authentication failed. Cannot proceed with other tests.")
            return self.generate_summary()
        
        # Client creation tests
        self.test_create_client_valid()
        self.test_create_client_invalid_email()
        self.test_create_client_missing_fields()
        self.test_create_client_duplicate_email()
        self.test_create_client_invalid_mobile()
        self.test_create_client_short_username()
        
        # Client listing test
        self.test_list_clients()
        
        # Client update tests
        self.test_update_client_valid()
        self.test_update_client_invalid_mobile()
        self.test_update_client_invalid_capacity()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  • {result['test']}")
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": passed_tests/total_tests*100 if total_tests > 0 else 0,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = TestSuperAdminClientManagement()
    summary = tester.run_all_tests()