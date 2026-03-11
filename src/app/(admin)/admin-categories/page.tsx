"use client";

import { AdminCategoriesPage, Category } from "@/features/admin/admin-categories";

// Mock data
const MOCK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Programming",
    description: "Software development and programming languages",
    subjects: [
      {
        id: "s1",
        name: "JavaScript",
        description: "Modern JavaScript and ES6+ features",
      },
      {
        id: "s2",
        name: "TypeScript",
        description: "Typed superset of JavaScript",
      },
      {
        id: "s3",
        name: "Python",
        description: "General-purpose programming language",
      },
    ],
  },
  {
    id: "2",
    name: "Web Development",
    description: "Frontend and backend web technologies",
    subjects: [
      {
        id: "s4",
        name: "React",
        description: "JavaScript library for building UIs",
      },
      {
        id: "s5",
        name: "Next.js",
        description: "React framework for production",
      },
      {
        id: "s6",
        name: "Node.js",
        description: "JavaScript runtime for servers",
      },
    ],
  },
  {
    id: "3",
    name: "Data Science",
    description: "Data analysis, machine learning, and AI",
    subjects: [
      {
        id: "s7",
        name: "Machine Learning",
        description: "ML algorithms and applications",
      },
      {
        id: "s8",
        name: "Data Analysis",
        description: "Data processing and visualization",
      },
    ],
  },
];

export default function CategoriesRoute() {
  const handleAddCategory = () => {
    console.log("Add category");
  };

  const handleEditCategory = (category: Category) => {
    console.log("Edit category:", category);
  };

  const handleDeleteCategory = (categoryId: string) => {
    console.log("Delete category:", categoryId);
  };

  const handleAddSubject = (categoryId: string) => {
    console.log("Add subject to category:", categoryId);
  };

  const handleEditSubject = (categoryId: string, subject: any) => {
    console.log("Edit subject:", subject, "in category:", categoryId);
  };

  const handleDeleteSubject = (categoryId: string, subjectId: string) => {
    console.log("Delete subject:", subjectId, "from category:", categoryId);
  };

  return (
    <AdminCategoriesPage
      categories={MOCK_CATEGORIES}
      onAddCategory={handleAddCategory}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
      onAddSubject={handleAddSubject}
      onEditSubject={handleEditSubject}
      onDeleteSubject={handleDeleteSubject}
    />
  );
}
