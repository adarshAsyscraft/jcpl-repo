import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../Config/AppConstant";
import { toast } from "react-toastify";

// ✅ Async thunk to create a new user
export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(`${API_URL}/users/create-user`, userData, config);
      toast.success("User created successfully!");
      return response.data; // This will contain { message: "User created successfully", userId: 7 }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user.");
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// ✅ Async thunk to fetch all users
export const fetchAllUsers = createAsyncThunk("users/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const response = await axios.get(`${API_URL}/users/getAllUser`, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Something went wrong");
    }
});

// ✅ Async thunk to fetch a single user by ID
export const fetchSingleUser = createAsyncThunk("users/fetchSingle", async (userId, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const response = await axios.get(`${API_URL}/users/get-user-by-id/${userId}`, config);
        console.log(response.data, "this is slice response of fetchSingleUser");
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Something went wrong");
    }
});

// ✅ Async thunk to delete a user
export const deleteUser = createAsyncThunk("users/delete", async (userId, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        await axios.delete(`${API_URL}/users/deleteUser/${userId}`, config);
        toast.success("User deleted successfully!");
        return userId; // Return ID to remove from state
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user.");
        return rejectWithValue(error.response?.data || "Something went wrong");
    }
});

// ✅ Async thunk to search users
export const searchUsers = createAsyncThunk("users/search", async (query, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      const response = await axios.get(`${API_URL}/users/searchUser?query=${query}`, config);
      return response.data.data; // Extract `data` array
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search users.");
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  });


// ✅ Thunk to update user
export const updateUser = createAsyncThunk("users/updateUser", async ({ id, userData }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/users/updateUser/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response, "this is response updateuser")
    return response.data; // Success response
  } catch (error) {
    return rejectWithValue(error.response?.data || "Something went wrong");
  }
});

// ✅ User Slice
const userSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        singleUser: null,
        total: 0,
        page: 1,
        totalPages: 1,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ✅ Handle createUser
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users.push({ id: action.payload.userId, ...action.meta.arg });
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ✅ Handle fetchAllUsers
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data?.users || [];
                state.total = action.payload.data?.total || 0;
                state.page = action.payload.data?.page || 1;
                state.totalPages = action.payload.data?.totalPages || 1;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ✅ Handle fetchSingleUser
            .addCase(fetchSingleUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSingleUser.fulfilled, (state, action) => {
                state.loading = false;
                state.singleUser = action.payload.data || null;
            })
            .addCase(fetchSingleUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ✅ Handle deleteUser
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(user => user.id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
             // ✅ Handle searchUsers
            .addCase(searchUsers.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
              state.loading = false;
              state.searchResults = action.payload || [];
            })
            .addCase(searchUsers.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const updatedUser = action.payload.data;
                state.users = state.users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
            })
            .addCase(updateUser.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            });
    },
});

export default userSlice.reducer;
