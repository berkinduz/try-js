import { exampleLabel, type Example } from "../../data/examples";
import { ExternalArrow } from "./ExternalArrow";

export function ExampleCard({
  example,
  heading = 2,
}: {
  example: Example;
  heading?: 2 | 3;
}) {
  const Heading = heading === 3 ? "h3" : "h2";
  return (
    <a
      class={`example-card example-card--${example.technology.toLowerCase()}`}
      href={`/snippets/${example.slug}`}
    >
      <div class="example-card__top">
        <span class="example-card__technology">{exampleLabel(example)}</span>
        {example.featured && <span class="example-card__pick">Start here</span>}
      </div>
      <Heading>{example.title}</Heading>
      <p>{example.description}</p>
      <div class="example-card__tags">
        {example.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div class="example-card__bottom">
        <span>{example.environment}</span>
        <ExternalArrow />
      </div>
    </a>
  );
}
