import { Schema, model, Document, Types } from "mongoose";

export interface IInternship extends Document {
  title: string;
  description: string;
  mediaUrl?: string;
  tasks: Types.ObjectId[]; // Reference to the Task model
}

const internshipSchema = new Schema<IInternship>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }], // Array of task references
});

const Internship = model<IInternship>("Internship", internshipSchema);

export default Internship;
