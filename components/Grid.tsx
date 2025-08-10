import { gridItems } from "@/data";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";

/**
 * A React component that renders a section containing a grid of items.
 *
 * This component uses the BentoGrid and BentoGridItem components to display
 * a collection of items defined in the gridItems array.
 * Each item in the grid displays a title, description, image, and optional
 * styling classes.
 *
 * @returns A section element with a grid of BentoGridItems.
 */
const Grid = () => {
  return (
    <section id="about">
      <BentoGrid className="w-full py-20">
        {gridItems.map((item, i) => (
          <BentoGridItem
            id={item.id}
            key={i}
            title={item.title}
            description={item.description}
            // remove icon prop
            // remove original classname condition
            className={item.className}
            img={item.img}
            imgClassName={item.imgClassName}
            titleClassName={item.titleClassName}
            spareImg={item.spareImg}
          />
        ))}
      </BentoGrid>
    </section>
  );
};

export default Grid;