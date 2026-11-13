"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Home() {
  const tasks = useQuery(api.tasks.get);
  return (
    <div>
      {tasks?.map((task) => (
        <div key={task._id}>
          <input
            type="checkbox"
            checked={task.isCompleted}
            onChange={() => {}}
          />
          <span>{task.text}</span>
        </div>
      ))}
    </div>
  );
}
