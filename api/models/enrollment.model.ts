import { Schema, model } from "mongoose";

interface IEnrollment extends Document {
  user: Schema.Types.ObjectId;
  internship: Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  taskSubmissions: Schema.Types.ObjectId[];
  isInternshipFinished: boolean;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  internship: {
    type: Schema.Types.ObjectId,
    ref: "Internship",
    required: true,
  },
  startDate: { type: Date, default: Date.now },
  endDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }, // 1 month later
  taskSubmissions: [{ type: Schema.Types.ObjectId, ref: "TaskSubmission" }],
  isInternshipFinished: { type: Boolean, default: false },
});

const Enrollment = model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;
