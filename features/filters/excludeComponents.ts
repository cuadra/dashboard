import { excludedList } from "@/src/data/excludedComponents";
export const filteredComponents = (components: any[]) => {
  return components.filter((c) => {
    const shortened = c.name.split("/").pop();
    return !excludedList.includes((shortened ?? "").toLowerCase());
  });
};
