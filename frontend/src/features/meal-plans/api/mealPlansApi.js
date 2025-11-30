/**
 * Meal Plans API Module
 * All API calls related to meal plan management
 */
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * List all meal plans with optional filtering
 * @param {Object} params - Query parameters { search, status }
 * @returns {Promise<Array>} Array of meal plan objects
 */
export const listMealPlans = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.MEAL_PLANS, { params });
  return response.data;
};

/**
 * Get a single meal plan by ID
 * @param {string} id - Meal plan ID
 * @returns {Promise<Object>} Meal plan object
 */
export const getMealPlanById = async (id) => {
  const response = await apiClient.get(API_ENDPOINTS.ADMIN.MEAL_PLAN_BY_ID(id));
  return response.data;
};

/**
 * Create a new meal plan
 * @param {Object} data - Meal plan data
 * @returns {Promise<Object>} Created meal plan object
 */
export const createMealPlan = async (data) => {
  const payload = {
    name: data.name.trim(),
    description: data.description.trim(),
    meals_included: data.meals_included, // array like ['Breakfast', 'Lunch']
    billing_type: data.billing_type,
    rate: parseFloat(data.rate) || 0,
    is_active: data.is_active ?? true,
  };
  
  const response = await apiClient.post(API_ENDPOINTS.ADMIN.MEAL_PLANS, payload);
  return response.data;
};

/**
 * Update an existing meal plan
 * @param {string} id - Meal plan ID
 * @param {Object} data - Updated meal plan data
 * @returns {Promise<Object>} Updated meal plan object
 */
export const updateMealPlan = async (id, data) => {
  const payload = {
    name: data.name.trim(),
    description: data.description.trim(),
    meals_included: data.meals_included,
    billing_type: data.billing_type,
    rate: parseFloat(data.rate) || 0,
    is_active: data.is_active ?? true,
  };
  
  const response = await apiClient.put(API_ENDPOINTS.ADMIN.MEAL_PLAN_BY_ID(id), payload);
  return response.data;
};

/**
 * Delete a meal plan
 * @param {string} id - Meal plan ID
 * @returns {Promise<void>}
 */
export const deleteMealPlan = async (id) => {
  const response = await apiClient.delete(API_ENDPOINTS.ADMIN.MEAL_PLAN_BY_ID(id));
  return response.data;
};

/**
 * Meal Plans API object (alternative export style)
 */
export const mealPlansApi = {
  list: listMealPlans,
  getById: getMealPlanById,
  create: createMealPlan,
  update: updateMealPlan,
  delete: deleteMealPlan,
};
