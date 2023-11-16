import { createSlice ,PayloadAction} from '@reduxjs/toolkit';
 
interface NotificationMessage {
    status : string;
    title :string;
    message:string;
}

interface UIStateType  {
    notification: NotificationMessage | null
}

const uiInitialState = { notification : null} as UIStateType;

const uiSlice = createSlice({
  name: 'ui',
  initialState: uiInitialState,
  reducers: {
    showNotification(state, action : PayloadAction<NotificationMessage>) {
      state.notification = {
        status: action.payload.status,
        title: action.payload.title,
        message: action.payload.message,
      };
    },
  },
});

export const { showNotification } = uiSlice.actions;

export default uiSlice.reducer;