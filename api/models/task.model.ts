import { Schema, model, Document } from "mongoose";

interface ITask extends Document {
  title: string;
  description: string;
  mediaUrl: string;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String, required: true },
});

const Task = model<ITask>("Task", taskSchema);

export default Task;
