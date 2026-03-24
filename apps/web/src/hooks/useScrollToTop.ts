
import { useEffect, useState } from 'react';

const useScrollToTop = (threshold: number) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 現在のスクロール位置が指定したしきい値より大きければアイコンを表示
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // スクロールイベントのリスナーを追加
    window.addEventListener('scroll', handleScroll);

    // クリーンアップ
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isVisible;
};

export default useScrollToTop;