import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import ts from "typescript";
import messages from "../src/lib/i18n/messages.json";
import {
  parseLocale,
  translate,
  locales,
  numberFormatter,
} from "../src/lib/i18n/core";
import { learning } from "../src/data/learning";
import { prompts } from "../src/data/prompts";
import { speakingTopics } from "../src/data/speaking";
import { projectInfo } from "../src/data/project";
import { categories } from "../src/lib/types";

test("locale input is bounded and placeholders preserve values in all languages", () => {
  for (const value of [
    undefined,
    null,
    "",
    "fr",
    "RU",
    "../../ru",
    "__proto__",
  ])
    assert.equal(parseLocale(value), "en");
  for (const locale of locales) {
    assert.equal(parseLocale(locale), locale);
    const label = translate(locale, "Question {current} of {total}", {
      current: 2,
      total: 10,
    });
    assert.ok(label.includes("2") && label.includes("10"));
    assert.ok(!label.includes("{"));
    assert.equal(
      translate(locale, "An arbitrary English learner answer"),
      "An arbitrary English learner answer",
    );
    assert.equal(translate(locale, 62.5), 62.5);
    assert.equal(translate(locale, null), null);
  }
  assert.equal(numberFormatter("en")(62.5), "62.5");
  assert.equal(numberFormatter("ru")(62.5), "62,5");
  assert.equal(numberFormatter("kk")(62.5), "62,5");
  assert.equal(translate("ru", "Home"), "Главная");
  assert.equal(translate("kk", "Home"), "Басты бет");
});

test("Russian and Kazakh messages are complete and retain interpolation placeholders", () => {
  const placeholders = (value: string) =>
    [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const [source, localized] of Object.entries(messages)) {
    for (const locale of ["ru", "kk"] as const) {
      assert.ok(localized[locale].trim(), `${source}: missing ${locale}`);
      assert.deepEqual(
        placeholders(localized[locale]),
        placeholders(source),
        `${source}: ${locale} placeholders`,
      );
    }
  }
  const content = [
    ...categories,
    ...learning.flatMap(
      ({ name, subtitle, description, steps, example, tip }) => [
        name,
        subtitle,
        description,
        ...steps,
        example,
        tip,
      ],
    ),
    ...prompts.flatMap(({ category, title, level }) => [
      category,
      title,
      ...(level === "All levels" ? [level] : []),
    ]),
    ...speakingTopics.flatMap(({ name, description }) => [name, description]),
    ...Object.values(projectInfo).flat(),
  ];
  for (const key of content)
    assert.ok(
      Object.hasOwn(messages, key),
      `Missing content translation: ${key}`,
    );
});

test("static translation calls across pages and components have dictionary entries", async () => {
  async function files(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map((e) =>
          e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
        ),
      )
    ).flat();
  }
  const ignored = new Set([
    "user",
    "copied",
    "error",
    " ",
    "*",
    "+",
    "",
    "—",
    "10",
    "2",
  ]);
  for (const file of [
    ...(await files("src/app")),
    ...(await files("src/components")),
  ].filter((f) => f.endsWith(".tsx"))) {
    const source = ts.createSourceFile(
      file,
      await readFile(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function check(node: ts.Node) {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(source) === "tr"
      ) {
        function literal(child: ts.Node) {
          if (ts.isStringLiteral(child) && !ignored.has(child.text))
            assert.ok(
              Object.hasOwn(messages, child.text),
              `${file}: missing ${child.text}`,
            );
          ts.forEachChild(child, literal);
        }
        if (node.arguments[0]) literal(node.arguments[0]);
      }
      ts.forEachChild(node, check);
    }
    check(source);
  }
});

const base = process.env.TEST_BASE_URL;
test(
  "server HTML, page titles, and language attributes follow the locale cookie",
  { skip: !base },
  async () => {
    for (const locale of locales) {
      for (const route of [
        "",
        "learn",
        "practice",
        "assistant",
        "prompts",
        "speaking",
        "research",
        "about",
      ]) {
        const response = await fetch(`${base}/${route}`, {
          headers: { Cookie: `english_lab_locale=${locale}` },
        });
        assert.equal(response.status, 200, `${locale}/${route}`);
        const html = await response.text();
        assert.ok(
          html.includes(`<html lang="${locale}"`),
          `${locale}/${route} lang`,
        );
        assert.ok(
          html.includes(translate(locale, "Start Learning")),
          `${locale}/${route} navigation`,
        );
        if (route === "research")
          assert.ok(
            html.includes(
              `<title>${translate(locale, "Research Results")} | English Lab</title>`,
            ),
          );
      }
    }
    const fallback = await fetch(`${base}/research`, {
      headers: { Cookie: "english_lab_locale=unsupported" },
    });
    assert.ok((await fallback.text()).includes('<html lang="en"'));
  },
);
