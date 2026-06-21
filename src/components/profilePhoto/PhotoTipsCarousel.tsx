import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PHOTO_EDUCATION_SLIDES } from "../../constants/photoPsychology";

type PhotoTipsCarouselProps = {
  className?: string;
};

export function PhotoTipsCarousel({ className = "" }: PhotoTipsCarouselProps) {
  const [index, setIndex] = useState(0);
  const slide = PHOTO_EDUCATION_SLIDES[index];
  const total = PHOTO_EDUCATION_SLIDES.length;

  const go = (delta: number) => {
    setIndex((current) => (current + delta + total) % total);
  };

  return (
    <section className={`photo-tips-carousel ${className}`.trim()} aria-label="Photo tips">
      <div className="photo-tips-carousel__slide">
        <h4>{slide.headline}</h4>
        <p>{slide.subtext}</p>
      </div>
      <div className="photo-tips-carousel__nav">
        <button
          type="button"
          className="photo-tips-carousel__arrow"
          onClick={() => go(-1)}
          aria-label="Previous tip"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="photo-tips-carousel__dots" role="tablist" aria-label="Photo tip slides">
          {PHOTO_EDUCATION_SLIDES.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              className={`photo-tips-carousel__dot${dotIndex === index ? " photo-tips-carousel__dot--active" : ""}`}
              onClick={() => setIndex(dotIndex)}
              aria-label={`Tip ${dotIndex + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="photo-tips-carousel__arrow"
          onClick={() => go(1)}
          aria-label="Next tip"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
