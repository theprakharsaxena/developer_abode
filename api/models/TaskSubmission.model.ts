import { Schema, model, Document } from "mongoose";

interface ITaskSubmission extends Document {
  task: Schema.Types.ObjectId;
  githubLink: string;
  liveLink: string;
  isSubmitted: boolean;
}

const taskSubmissionSchema = new Schema<ITaskSubmission>({
  task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  githubLink: { type: String, default: "" },
  liveLink: { type: String, default: "" },
  isSubmitted: { type: Boolean, default: false },
});

const TaskSubmission = model<ITaskSubmission>(
  "TaskSubmission",
  taskSubmissionSchema
);

export default TaskSubmission;
