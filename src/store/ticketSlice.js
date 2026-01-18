
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../services/api';

export const fetchTickets = createAsyncThunk(
  'tickets/fetchAll',
  async ({ status }, { rejectWithValue }) => {
    try {
      
      
      const response = await adminApi.getTickets({ status }); 
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách ticket');
    }
  }
);

export const resolveTicket = createAsyncThunk(
  'tickets/resolve',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      
      const response = await adminApi.resolveTicket(id, status);
      return response.data.ticket; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi xử lý ticket');
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
  error: null,
};


const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;

        if (Array.isArray(action.payload)) {
          
          state.items = action.payload;
        } else {
          state.items = action.payload.data;
          state.pagination = action.payload.pagination;
        }
        
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(resolveTicket.fulfilled, (state, action) => {
        
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default ticketSlice.reducer;