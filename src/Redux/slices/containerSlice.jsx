import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import containerService from "../../Services/container";

// Fetch Containers
export const fetchContainers = createAsyncThunk(
  "container/fetchContainers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await containerService.getAll();
      console.log("")
      if(response.success){
        // toast.success("Container List Fetched Successfully")
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

// Create Container
export const createContainer = createAsyncThunk(
  "container/createContainer",
  async (containerData, { rejectWithValue }) => {
    try {
      const response = await containerService.create(containerData);
      console.log("response::",response)
      if(response.success){
        toast.success("Container Created Successfully")
        return response;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

// Update Container ✅
export const updateContainer = createAsyncThunk(
  "container/updateContainer",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await containerService.update(id, updatedData);
      if(response.success){
        toast.success("Container Updated Successfully")
        return response;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

// Delete Container
export const deleteContainer = createAsyncThunk(
  "container/deleteContainer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await containerService.delete(id);
      if(response.success){
        toast.success("Container Deleted Successfully")
        return response;
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

// Fetch Container by Container Number
export const fetchContainerByNumber = createAsyncThunk(
  "container/fetchContainerByNumber",
  async (containerNumber, { rejectWithValue }) => {
    try {
      const response = await containerService.getByContainerNumber(containerNumber);
      if (response.success) {
        // toast.success("Container fetched successfully!");
        return response.data;
      } else {
        return rejectWithValue("No container found.");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

export const checkValidContainer = createAsyncThunk(
  "container/checkValidContainer",
  async (containerNumber, { rejectWithValue }) => {
    try {
      const response = await containerService.checkValidConatiner(containerNumber);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

export const getPrefillData = createAsyncThunk(
  "container/getPrefillData",
  async (containerNumber, { rejectWithValue }) => {
    try {
      const response = await containerService.prefillData(containerNumber);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

export const arrivalContainer = createAsyncThunk(
  "container/arrivalContainer",
  async (containerNumber, { rejectWithValue }) => {
    try {
      const response = await containerService.arrivalContainerExist(containerNumber);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong.");
    }
  }
);

const containerSlice = createSlice({
  name: "container",
  initialState: {
    containers: [],
    loading: false,
    error: null,
    fetchedContainer:null,
    prefillData:null,
    container:null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchContainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContainers.fulfilled, (state, action) => {
        state.loading = false;
        state.containers = action.payload;
      })
      .addCase(fetchContainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.containers.push(action.payload);
      })
      .addCase(createContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Update
      .addCase(updateContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContainer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.containers.findIndex(
          (container) => container.id === action.payload.id
        );
        if (index !== -1) {
          state.containers[index] = action.payload;
        }
      })
      .addCase(updateContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteContainer.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.containers = state.containers.filter(
          (container) => container.id !== action.payload
        );
      })
      .addCase(deleteContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(fetchContainerByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContainerByNumber.fulfilled, (state, action) => {
        state.loading = false;
        // Example: Save it in a separate state
        state.fetchedContainer = action.payload;
      })
      .addCase(fetchContainerByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // check Valid container number
      .addCase(checkValidContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkValidContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchedContainer = action.payload;
      })
      .addCase(checkValidContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // prefill data
      .addCase(getPrefillData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPrefillData.fulfilled, (state, action) => {
        state.loading = false;
        state.prefillData = action.payload;
      })
      .addCase(getPrefillData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // prefill data
      .addCase(arrivalContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(arrivalContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.prefillData = action.payload;
      })
      .addCase(arrivalContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
  },
});

export default containerSlice.reducer;
