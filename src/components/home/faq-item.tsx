"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

/**
 * FAQ Item - Client Component
 * 单个FAQ项,需要客户端交互(展开/收起)
 */
export function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "group overflow-hidden transition-all duration-300",
      "bg-magellan-depth-50 hover:bg-white",
      "border border-magellan-primary/15 hover:border-magellan-primary/30",
      "rounded-xl shadow-sm hover:shadow-md",
      "professional-glow"
    )}>
      <div className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left p-6 flex items-center justify-between group/btn transition-all duration-300"
        >
          <div className="flex items-center gap-4 flex-1">
            {/* 航海序号指示器 */}
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300 flex items-center justify-center",
              "bg-gradient-to-br from-magellan-primary/10 to-magellan-teal/10",
              "border border-magellan-primary/20 group-hover/btn:border-magellan-primary/40",
              "group-hover/btn:bg-gradient-to-br group-hover/btn:from-magellan-primary/15 group-hover/btn:to-magellan-teal/15",
              "min-w-[48px] h-12"
            )}>
              <span className="font-bold text-magellan-primary text-sm">
                {(index + 1).toString().padStart(2, '0')}
              </span>
            </div>

            {/* 问题标题 */}
            <h3 className={cn(
              "font-semibold text-magellan-depth-900 transition-colors duration-300",
              "group-hover/btn:text-magellan-primary text-base md:text-lg"
            )}>
              {question}
            </h3>
          </div>

          {/* 展开指示器 */}
          <div className={cn(
            "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
            "bg-magellan-depth-100 group-hover/btn:bg-magellan-primary/10",
            "border border-magellan-primary/10 group-hover/btn:border-magellan-primary/20",
            isOpen ? 'rotate-180' : 'rotate-0'
          )}>
            <ChevronDown className="h-5 w-5 text-magellan-depth-600 group-hover/btn:text-magellan-primary transition-colors" />
          </div>
        </button>

        {/* 答案区域 - 使用CSS transition代替framer-motion */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="px-6 pb-6">
            <div className="pl-16">
              <div className={cn(
                "pl-4 py-4 rounded-lg",
                "bg-gradient-to-r from-magellan-primary/5 to-magellan-teal/5",
                "border-l-4 border-magellan-primary/30"
              )}>
                <p className="text-magellan-depth-700 leading-relaxed">
                  {answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
