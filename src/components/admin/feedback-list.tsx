"use client";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/ui/common/table";
import { Card } from "@/ui/common/card";
import { MessageSquare } from "lucide-react";

export interface FeedbackItem {
  id: string;
  name: string | null;
  content: string;
  source: string | null;
  status: string;
  createdAt: string | Date;
}

export function FeedbackList({ items }: { items: FeedbackItem[] }) {
  return (
    <Card className="p-4 border border-border/40 bg-background/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" />
        <h2 className="text-lg font-semibold">反馈列表</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-background/20">
            <TableHead>时间</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>来源</TableHead>
            <TableHead>内容</TableHead>
            <TableHead>状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((f) => (
            <TableRow key={f.id} className="border-b border-border/30">
              <TableCell className="text-sm text-muted-foreground">
                {new Date(f.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm">{f.name || '-'}</TableCell>
              <TableCell className="text-sm">{f.source || '-'}</TableCell>
              <TableCell className="text-sm max-w-[600px] whitespace-pre-wrap break-words">
                {f.content}
              </TableCell>
              <TableCell className="text-sm">{f.status}</TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                暂无反馈
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

