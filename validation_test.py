#!/usr/bin/env python3
"""
Focused validation testing for Client Update Endpoint
Tests the specific validation fixes mentioned in the review request.
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://messmanager-1.preview.emergentagent.com/api"

class ValidationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.access_token = None
        self.test_results = []
        self.existing_tenant_id = None
        
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
        
        login_data = {
            "username": "superadmin",
            "password": "Admin@123"
        }
        
        try:
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
    
    def get_existing_tenant(self):
        """Get an existing tenant for update tests"""
        print("\n=== Getting Existing Tenant for Update Tests ===")
        
        try:
            response = requests.get(
                f"{self.base_url}/super-admin/tenants",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                tenants = response.json()
                if tenants and len(tenants) > 0:
                    self.existing_tenant_id = tenants[0]["id"]
                    self.log_result("Get Existing Tenant", True, f"Found tenant ID: {self.existing_tenant_id}")
                    return True
                else:
                    self.log_result("Get Existing Tenant", False, "No tenants found")
                    return False
            else:
                self.log_result("Get Existing Tenant", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Existing Tenant", False, f"Exception: {str(e)}")
            return False
    
    def test_update_invalid_mobile_format(self):
        """Test client update with invalid mobile format - should return 422"""
        print("\n=== Testing Update with Invalid Mobile Format (Non-10 digits) ===")
        
        if not self.existing_tenant_id:
            self.log_result("Update Invalid Mobile Format", False, "No tenant ID available")
            return False
        
        # Test with non-10 digit mobile
        update_data = {
            "mobile": "12345"  # Only 5 digits
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{self.existing_tenant_id}",
                json=update_data,
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
                        self.log_result("Update Invalid Mobile Format", True, "✅ FIXED: Now returns 422 with proper validation error")
                        return True
                
                self.log_result("Update Invalid Mobile Format", False, f"422 returned but unexpected error format: {data}")
                return False
            elif response.status_code == 200:
                self.log_result("Update Invalid Mobile Format", False, "❌ VALIDATION MISSING: Returns 200 instead of 422 - validation not working")
                return False
            else:
                self.log_result("Update Invalid Mobile Format", False, f"Unexpected status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Invalid Mobile Format", False, f"Exception: {str(e)}")
            return False
    
    def test_update_invalid_mobile_letters(self):
        """Test client update with letters in mobile - should return 422"""
        print("\n=== Testing Update with Letters in Mobile ===")
        
        if not self.existing_tenant_id:
            self.log_result("Update Mobile with Letters", False, "No tenant ID available")
            return False
        
        # Test with letters in mobile
        update_data = {
            "mobile": "abcd123456"  # Contains letters
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{self.existing_tenant_id}",
                json=update_data,
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
                        self.log_result("Update Mobile with Letters", True, "✅ FIXED: Now returns 422 with proper validation error")
                        return True
                
                self.log_result("Update Mobile with Letters", False, f"422 returned but unexpected error format: {data}")
                return False
            elif response.status_code == 200:
                self.log_result("Update Mobile with Letters", False, "❌ VALIDATION MISSING: Returns 200 instead of 422 - validation not working")
                return False
            else:
                self.log_result("Update Mobile with Letters", False, f"Unexpected status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Mobile with Letters", False, f"Exception: {str(e)}")
            return False
    
    def test_update_negative_capacity(self):
        """Test client update with negative capacity - should return 422"""
        print("\n=== Testing Update with Negative Capacity ===")
        
        if not self.existing_tenant_id:
            self.log_result("Update Negative Capacity", False, "No tenant ID available")
            return False
        
        # Test with negative capacity
        update_data = {
            "capacity": -10
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{self.existing_tenant_id}",
                json=update_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                data = response.json()
                if "detail" in data and isinstance(data["detail"], list):
                    errors = data["detail"]
                    capacity_error = any(
                        err.get("loc", [])[-1] == "capacity" and ("greater than 0" in str(err.get("msg", "")) or "positive" in str(err.get("msg", "")))
                        for err in errors if isinstance(err, dict)
                    )
                    if capacity_error:
                        self.log_result("Update Negative Capacity", True, "✅ FIXED: Now returns 422 with proper validation error")
                        return True
                
                self.log_result("Update Negative Capacity", False, f"422 returned but unexpected error format: {data}")
                return False
            elif response.status_code == 200:
                self.log_result("Update Negative Capacity", False, "❌ VALIDATION MISSING: Returns 200 instead of 422 - validation not working")
                return False
            else:
                self.log_result("Update Negative Capacity", False, f"Unexpected status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Negative Capacity", False, f"Exception: {str(e)}")
            return False
    
    def test_update_zero_capacity(self):
        """Test client update with zero capacity - should return 422"""
        print("\n=== Testing Update with Zero Capacity ===")
        
        if not self.existing_tenant_id:
            self.log_result("Update Zero Capacity", False, "No tenant ID available")
            return False
        
        # Test with zero capacity
        update_data = {
            "capacity": 0
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{self.existing_tenant_id}",
                json=update_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                data = response.json()
                if "detail" in data and isinstance(data["detail"], list):
                    errors = data["detail"]
                    capacity_error = any(
                        err.get("loc", [])[-1] == "capacity" and ("greater than 0" in str(err.get("msg", "")) or "positive" in str(err.get("msg", "")))
                        for err in errors if isinstance(err, dict)
                    )
                    if capacity_error:
                        self.log_result("Update Zero Capacity", True, "✅ FIXED: Now returns 422 with proper validation error")
                        return True
                
                self.log_result("Update Zero Capacity", False, f"422 returned but unexpected error format: {data}")
                return False
            elif response.status_code == 200:
                self.log_result("Update Zero Capacity", False, "❌ VALIDATION MISSING: Returns 200 instead of 422 - validation not working")
                return False
            else:
                self.log_result("Update Zero Capacity", False, f"Unexpected status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Zero Capacity", False, f"Exception: {str(e)}")
            return False
    
    def test_update_valid_data(self):
        """Test client update with valid data - should return 200"""
        print("\n=== Testing Update with Valid Data ===")
        
        if not self.existing_tenant_id:
            self.log_result("Update Valid Data", False, "No tenant ID available")
            return False
        
        # Test with valid data
        update_data = {
            "mess_name": "Updated Mess Name",
            "owner_name": "Updated Owner",
            "address": "Updated Address",
            "mobile": "9876543210",  # Valid 10-digit mobile
            "capacity": 150  # Positive capacity
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/super-admin/tenants/{self.existing_tenant_id}",
                json=update_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                # Check if updates were applied
                if (data.get("mess_name") == "Updated Mess Name" and 
                    data.get("capacity") == 150 and 
                    data.get("mobile") == "9876543210"):
                    self.log_result("Update Valid Data", True, "✅ Valid updates work correctly with 200 status")
                    return True
                else:
                    self.log_result("Update Valid Data", False, f"Updates not reflected properly: {data}")
                    return False
            else:
                self.log_result("Update Valid Data", False, f"Expected 200, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Valid Data", False, f"Exception: {str(e)}")
            return False
    
    def test_create_short_password(self):
        """Test client creation with short password - should return 422"""
        print("\n=== Testing Create Client with Short Password ===")
        
        client_data = {
            "mess_name": "Short Password Test Mess",
            "owner_name": "Short Pass User",
            "email": "shortpass@testmess.com",
            "mobile": "9876543215",
            "address": "333 Test Street, Test City",
            "capacity": 100,
            "subscription_plan": "BASIC",
            "username": "shortpass123",
            "password": "123"  # Less than 8 characters
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
                        err.get("loc", [])[-1] == "password" and ("8 characters" in str(err.get("msg", "")) or "8" in str(err.get("msg", "")))
                        for err in errors if isinstance(err, dict)
                    )
                    if password_error:
                        self.log_result("Create Short Password", True, "✅ FIXED: Password validation working - returns 422")
                        return True
                
                self.log_result("Create Short Password", False, f"422 returned but unexpected error format: {data}")
                return False
            elif response.status_code == 200 or response.status_code == 201:
                self.log_result("Create Short Password", False, "❌ VALIDATION MISSING: Short password accepted - validation not working")
                return False
            else:
                self.log_result("Create Short Password", False, f"Unexpected status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Short Password", False, f"Exception: {str(e)}")
            return False
    
    def run_validation_tests(self):
        """Run focused validation tests"""
        print("🔍 Starting Focused Validation Tests for Client Update Endpoint")
        print(f"Backend URL: {self.base_url}")
        print("=" * 70)
        
        # Authentication test
        if not self.test_super_admin_login():
            print("\n❌ Authentication failed. Cannot proceed with other tests.")
            return self.generate_summary()
        
        # Get existing tenant for update tests
        if not self.get_existing_tenant():
            print("\n❌ No existing tenant found. Cannot proceed with update tests.")
            return self.generate_summary()
        
        # Primary focus: Client Update Endpoint validation
        print("\n🎯 PRIMARY FOCUS: Client Update Endpoint Validation")
        self.test_update_invalid_mobile_format()
        self.test_update_invalid_mobile_letters()
        self.test_update_negative_capacity()
        self.test_update_zero_capacity()
        self.test_update_valid_data()
        
        # Secondary: Password validation on create
        print("\n🎯 SECONDARY: Password Validation on Create")
        self.test_create_short_password()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 70)
        print("📊 VALIDATION TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        # Categorize results
        validation_fixed = []
        validation_missing = []
        other_issues = []
        
        for result in self.test_results:
            if not result["success"]:
                if "VALIDATION MISSING" in result["details"]:
                    validation_missing.append(result)
                else:
                    other_issues.append(result)
            elif "FIXED" in result["details"]:
                validation_fixed.append(result)
        
        if validation_fixed:
            print(f"\n✅ VALIDATION FIXES WORKING ({len(validation_fixed)}):")
            for result in validation_fixed:
                print(f"  • {result['test']}")
        
        if validation_missing:
            print(f"\n❌ VALIDATION STILL MISSING ({len(validation_missing)}):")
            for result in validation_missing:
                print(f"  • {result['test']}: {result['details']}")
        
        if other_issues:
            print(f"\n⚠️  OTHER ISSUES ({len(other_issues)}):")
            for result in other_issues:
                print(f"  • {result['test']}: {result['details']}")
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "validation_fixed": len(validation_fixed),
            "validation_missing": len(validation_missing),
            "other_issues": len(other_issues),
            "success_rate": passed_tests/total_tests*100 if total_tests > 0 else 0,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = ValidationTester()
    summary = tester.run_validation_tests()