"use client";

import { RootLayout } from "@/components/common/RootLayout";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { VideoList } from "@/components/video/VideoList";
import { useVideosQuery } from "@/services/useVideos";
import { useSettingsStore } from "@/stores/settings-store";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export default function HomePage() {
  const settings = useSettingsStore((state) => state.settings);

  // 最新の動画を取得
  const { data: latestData, isLoading: latestLoading } = useVideosQuery({
    limit: 10,
    sort: "jikkyo_date",
    order: "desc",
  });
  const latestVideos = (latestData as any)?.data || [];

  // マイリストの動画IDを取得（最初の10個）
  const mylistIds =
    settings.mylist
      ?.slice(0, 10)
      .map((item: any) => item.id)
      .filter((id: any): id is number => typeof id === "number") || [];
  const { data: mylistData, isLoading: mylistLoading } = useVideosQuery(
    mylistIds.length > 0 ? { ids: mylistIds } : undefined,
    { enabled: mylistIds.length > 0 },
  );
  const mylistVideos = (mylistData as any)?.data || [];

  // 視聴履歴の動画IDを取得（最初の10個）
  const watchedIds =
    settings.watched_history
      ?.slice(0, 10)
      .map((item: any) => item.video_id)
      .filter((id: any): id is number => typeof id === "number") || [];
  const { data: watchedData, isLoading: watchedLoading } = useVideosQuery(
    watchedIds.length > 0 ? { ids: watchedIds } : undefined,
    { enabled: watchedIds.length > 0 },
  );
  const watchedVideos = (watchedData as any)?.data || [];

  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{ label: "ホーム", href: "/" }]} />

        <div className="space-y-12">
          {/* 最新の動画セクション */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">最新の動画</h2>
              <div className="flex items-center gap-2">
                <Link
                  to="/videos"
                  className="text-sm text-blue-500 hover:text-blue-600 underline"
                >
                  もっと見る
                  
                </Link>
                <ChevronRight width={21} height={21} className="text-white" />
              </div>
            </div>
            <VideoList
              title="最新の動画"
              videos={latestVideos}
              total={latestVideos.length}
              isLoading={latestLoading}
              hideHeader={true}
              hideSort={true}
              hidePagination={true}
              showEmptyMessage={true}
            />
          </section>

          {/* マイリストセクション */}
          {mylistVideos.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Link
                    to="/mylist"
                    className="text-sm text-blue-500 hover:text-blue-600 underline"
                  >
                    もっと見る
                  </Link>
                  <ChevronRight width={21} height={21} className="text-white" />
                </div>
              </div>
              <VideoList
                title="マイリスト"
                videos={mylistVideos}
                total={mylistVideos.length}
                isLoading={mylistLoading}
                hideHeader={true}
                hideSort={true}
                hidePagination={true}
                showEmptyMessage={true}
              />
            </section>
          )}

          {/* 視聴履歴セクション */}
          {watchedVideos.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">視聴履歴</h2>
                <div className="flex items-center gap-2">
                  <Link
                    to="/watched-history"
                    className="text-sm text-blue-500 hover:text-blue-600 underline"
                  >
                    もっと見る
                  </Link>
                  <ChevronRight width={21} height={21} className="text-white" />
                </div>
              </div>
              <VideoList
                title="視聴履歴"
                videos={watchedVideos}
                total={watchedVideos.length}
                isLoading={watchedLoading}
                hideHeader={true}
                hideSort={true}
                hidePagination={true}
                showEmptyMessage={true}
              />
            </section>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
