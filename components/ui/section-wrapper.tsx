"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "featured";
  animate?: boolean;
  delay?: number;
  id?: string;
}

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export function SectionWrapper({
  children,
  className = "",
  variant = "default",
  animate = true,
  delay = 0,
  id
}: SectionWrapperProps) {
  const baseClasses = "section-surface relative overflow-hidden";

  const variantClasses = {
    default: "p-6 md:p-8",
    elevated: "p-8 md:p-12 shadow-xl",
    featured: "p-8 md:p-12 section-surface--interactive"
  };

  const fullClassName = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (!animate) {
    return (
      <div id={id} className={fullClassName}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={fullClassName}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
      transition={{ duration: 0.6, delay, type: "tween" }}
    >
      {children}
    </motion.div>
  );
}

interface SectionHeaderProps {
  tag?: string;
  title: string;
  subtitle?: string;
  animate?: boolean;
}

export function SectionHeader({
  tag,
  title,
  subtitle,
  animate = true
}: SectionHeaderProps) {
  if (!animate) {
    return (
      <div className="section-header">
        {tag && <span className="section-header-tag">{tag}</span>}
        <h2 className="section-header-title">{title}</h2>
        {subtitle && <p className="text-subtle">{subtitle}</p>}
        <div className="section-header-divider" />
      </div>
    );
  }

  return (
    <motion.div
      className="section-header"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {tag && (
        <motion.span
          className="section-header-tag"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          {tag}
        </motion.span>
      )}
      <h2 className="section-header-title">{title}</h2>
      {subtitle && <p className="text-subtle">{subtitle}</p>}
      <motion.div
        className="section-header-divider"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ originX: 0 }}
      />
    </motion.div>
  );
}

interface AnimatedGridProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
  stagger?: number;
}

export function AnimatedGrid({
  children,
  columns = 2,
  gap = "gap-3",
  stagger = 0.1
}: AnimatedGridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <motion.div
      className={`grid ${gridClass[columns as keyof typeof gridClass]} ${gap}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {React.Children.map(children, (child, idx) => (
        <motion.div
          key={idx}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                delay: idx * stagger
              }
            }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
