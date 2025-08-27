import fs from "fs";
import express from "express";

const app = express();

app.get("/api/data", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
    let result = [...data];

    const { order = "asc", limit, sortby, ...filters } = req.query;

    // ✅ Filtering (e.g. ?Family=Indo-European&Region=India)
    Object.keys(filters).forEach((key) => {
      result = result.filter((item) =>
        String(item[key]).toLowerCase().includes(String(filters[key]).toLowerCase())
      );
    });

    // ✅ Sorting by "Language" property only
    result.sort((a, b) => {
      const valA = a["Language"];
      const valB = b["Language"];
      if (sortby === "atoz") {
        return String(valA).localeCompare(String(valB));
      } else if (sortby === "ztoa") {
        return String(valB).localeCompare(String(valA));
      } else {
        // fallback to order param
        return order === "desc"
          ? String(valB).localeCompare(String(valA))
          : String(valA).localeCompare(String(valB));
      }
    });

    // ✅ Limit results (e.g. ?limit=5)
    if (limit) {
      result = result.slice(0, parseInt(limit));
    }

    // ✅ Return with total
    res.status(200).json({
      total: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: "Error reading JSON" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}/api/data`);
});
   