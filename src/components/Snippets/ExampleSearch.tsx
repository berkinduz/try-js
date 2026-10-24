import { useEffect, useRef, useState } from "preact/hooks";
import {
  filterExamples,
  GOALS,
  TECHNOLOGIES,
  type ExampleGoal,
  type ExampleTechnology,
} from "../../data/examples";
import { trackEvent } from "../../utils/analytics";

export function useExampleSearch() {
  const [query, setQuery] = useState("");
  const [technology, setTechnology] = useState<ExampleTechnology>("All");
  const [goal, setGoal] = useState<ExampleGoal>("all");
  return {
    query,
    setQuery,
    technology,
    setTechnology,
    goal,
    setGoal,
    results: filterExamples(query, technology, goal),
    reset() {
      setQuery("");
      setTechnology("All");
      setGoal("all");
    },
  };
}

export function ExampleSearch({
  search,
  compact = false,
  autoFocus = false,
}: {
  search: ReturnType<typeof useExampleSearch>;
  compact?: boolean;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    setInteractive(true);
  }, []);
  useEffect(() => {
    if (interactive && autoFocus) inputRef.current?.focus();
  }, [interactive, autoFocus]);
  return (
    <div
      class={`examples-filters ${compact ? "examples-filters--compact" : ""}`}
    >
      <label class="examples-search">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <span class="sr-only">Search examples</span>
        <input
          ref={inputRef}
          type="search"
          disabled={!interactive}
          value={search.query}
          placeholder="Search by task, package or technology…"
          onInput={(event) => search.setQuery(event.currentTarget.value)}
        />
      </label>
      <fieldset class="examples-filter-row">
        <legend class="sr-only">Technology</legend>
        {TECHNOLOGIES.map((value) => (
          <button
            key={value}
            type="button"
            disabled={!interactive}
            aria-pressed={search.technology === value}
            onClick={() => {
              search.setTechnology(value);
              trackEvent("examples_filter_used", {
                filter: "technology",
                value,
              });
            }}
          >
            {value}
          </button>
        ))}
      </fieldset>
      <div class="examples-filter-bottom">
        <label class="examples-goal">
          Goal
          <select
            disabled={!interactive}
            value={search.goal}
            onChange={(event) => {
              const value = event.currentTarget.value as ExampleGoal;
              search.setGoal(value);
              trackEvent("examples_filter_used", { filter: "goal", value });
            }}
          >
            {GOALS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        </label>
        <span class="examples-result-count" role="status">
          {search.results.length}{" "}
          {search.results.length === 1 ? "example" : "examples"}
        </span>
        {(search.query ||
          search.technology !== "All" ||
          search.goal !== "all") && (
          <button class="examples-clear" type="button" onClick={search.reset}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
