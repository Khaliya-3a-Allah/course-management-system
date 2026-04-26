import mongoose from "mongoose";

const searchQueryAnalyticsSchema = new mongoose.Schema(
  {
    query: { type: String, default: "" },
    normalizedQuery: { type: String, default: "", index: true },
    filters: {
      category: [{ type: String }],
      level: [{ type: String }],
      tags: [{ type: String }],
    },
    sortBy: {
      type: String,
      enum: ["relevance", "rating", "time"],
      default: "relevance",
    },
    page: { type: Number, default: 1, min: 1 },
    pageSize: { type: Number, default: 8, min: 1 },
    resultsCount: { type: Number, default: 0, min: 0 },
    latencyMs: { type: Number, default: 0, min: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

searchQueryAnalyticsSchema.index({ createdAt: -1 });

const SearchQueryAnalytics = mongoose.model("SearchQueryAnalytics", searchQueryAnalyticsSchema);
export default SearchQueryAnalytics;
