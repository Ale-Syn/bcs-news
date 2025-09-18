import { Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { useGetRecentPosts } from "@/lib/react-query/queries";

const BreakingNewsTicker = () => {
  const { data: recentPosts } = useGetRecentPosts();
  const breakingPosts = recentPosts?.documents || [];
  const breakingTitles = useMemo<string[]>(
    () => (breakingPosts?.slice(0, 10).map((p: any) => p.title) || []),
    [breakingPosts]
  );
  const [breakingIndex, setBreakingIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (!breakingTitles || breakingTitles.length === 0) return;
    const safeIndex = breakingIndex % breakingTitles.length;
    const fullText = breakingTitles[safeIndex] || "";
    if (typedText.length < fullText.length) {
      const t = setTimeout(() => setTypedText(fullText.slice(0, typedText.length + 1)), 25);
      return () => clearTimeout(t);
    }
    const hold = setTimeout(() => {
      setTypedText("");
      setBreakingIndex((i) => (i + 1) % breakingTitles.length);
    }, 1800);
    return () => clearTimeout(hold);
  }, [breakingTitles, breakingIndex, typedText]);

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-3 text-[#1A1A1A]">
        <span className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0">
          Noticias de última hora
        </span>
        <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap">
          <div className="pl-4">
            {breakingTitles.length > 0 && (
              <Link
                to={`/posts/${(breakingPosts[breakingIndex % breakingTitles.length] as any).$id}`}
                className="text-base sm:text-lg hover:underline inline-block text-[#1A1A1A]"
              >
                {typedText}
                <span className="ml-1 opacity-60">|</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;


