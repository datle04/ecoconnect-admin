
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../services/api';


export const fetchEvents = createAsyncThunk(
  'events/fetchByStatus',
  async ({ status, city, keyword, page, limit }, { rejectWithValue }) => {
    try {
      console.log(status);
      
      
      const response = await adminApi.getEvents({ status, city, keyword, page, limit });
      console.log(response.data)
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách');
    }
  }
);

export const approveEvent = createAsyncThunk(
  'events/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.approveEvent(id);
      console.log(response.data.event);
      
      return response.data.event; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi duyệt sự kiện');
    }
  }
);

export const rejectEvent = createAsyncThunk(
  'events/reject',
  
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      
      const response = await adminApi.rejectEvent(id, reason);
      console.log(response.data.event);
      return response.data.event;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi từ chối sự kiện');
    }
  }
);

export const deleteEventForce = createAsyncThunk(
  'events/deleteForce',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      await adminApi.deleteEventForce(id, reason);
      return id; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);


const initialState = {
  items: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10
  },
  loading: false,
  actionLoading: false, 
  error: null,
};


const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        
        
        if (Array.isArray(action.payload)) {
             state.items = action.payload; 
        } else {
             state.items = action.payload.data;
             state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(approveEvent.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(approveEvent.fulfilled, (state, action) => {
        state.actionLoading = false;
        
        const index = state.items.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      
      .addCase(rejectEvent.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.items.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteEventForce.fulfilled, (state, action) => {
        state.items = state.items.filter(e => e._id !== action.payload);
      });
  },
});

export default eventSlice.reducer;