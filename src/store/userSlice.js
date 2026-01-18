
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../services/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async ({ page, limit, keyword }, { rejectWithValue }) => {
    try {
      const response = await adminApi.getUsers({ page, limit, keyword });
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ id, status, reason }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUserStatus(id, status, reason);
      return response.data.user; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);


export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUserRole(id, role);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    pagination: { total: 0, page: 1, limit: 10 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
           state.items = action.payload;
        } else {
           state.items = action.payload.data;
           state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(u => u._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.items.findIndex(u => u._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export default userSlice.reducer;