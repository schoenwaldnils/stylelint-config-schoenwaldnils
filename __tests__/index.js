const config = require("../");
const stylelint = require("stylelint");
const test = require("ava");

const validCss = `/** @define Selector */

/**
 * Multi-line comment
 */

.Selector-1 {
  --background-color: green;
}

.Selector-1,
.Selector-2,
.Selector-3[type='text'] {
  box-sizing: border-box;
  display: block;
  color: #333;
  background: linear-gradient(#fff, rgba(0 0 0 / 80%));
}

.Selector-a,
.Selector-b {
  top: calc(calc(1em * 2) / 3);
  padding: 10px !important;
}

.Selector-x {
  width: 10%;
}

/* Single-line comment */

@media (width >= 60em) {
  .Selector {
    transform: translate(1, 1) scale(3);
  }
}

@media (orientation: portrait),
  projection and (color) {
  .Selector-i + .Selector-ii {
    font-family: helvetica, arial, sans-serif;
    background: color(rgb(0 0 0) .5);
  }
}

@media screen and (resolution = 192dpi),
  screen and (resolution = 2dppx) {
  .Selector {
    height: 10rem;
    margin: 10px;
    margin-bottom: 5px;
    background-image:
      repeating-linear-gradient(
        -45deg,
        transparent,
        #fff 25px,
        rgba(255 255 255 / 100%) 50px
      );
    box-shadow:
      0 1px 1px #000,
      0 1px 0 #fff,
      2px 2px 1px 1px #ccc inset;
  }

  .Selector::after {
    content: '→';
    background-image: url('x.svg');
  }
}

`;

const invalidCss = `a {} a {
  top: .2em;
}
@media (min-width >= 60em) {
  top: 0.2em;
}
`;

test("no warnings with valid css", (t) => {
  return stylelint
    .lint({
      code: validCss,
      config,
    })
    .then((data) => {
      const { errored, results } = data;
      const { warnings, invalidOptionWarnings } = results[0];

      if (warnings[0] || invalidOptionWarnings[0]) {
        invalidOptionWarnings.forEach((warning) => {
          console.error(`Line: ${warning.line}`, "\n", warning.text, "\n");
        });

        warnings.forEach((warning) => {
          console.error(`Line: ${warning.line}`, "\n", warning.text, "\n");
        });
      }

      t.falsy(errored, "no errored");
      t.is(warnings.length, 0, "flags no warnings");
    });
});

test("a warning with invalid css", (t) => {
  return stylelint
    .lint({
      code: invalidCss,
      config,
    })
    .then((data) => {
      const { errored, results } = data;
      const { warnings } = results[0];

      t.truthy(errored, "errored");
      t.is(warnings.length, 5, "flags 5 warnings");
      t.is(
        warnings[0].text,
        "Expected empty line before at-rule (at-rule-empty-line-before)",
        "correct warning text"
      );
      t.is(
        warnings[1].text,
        "Unexpected empty block (block-no-empty)",
        "correct warning text"
      );
      t.is(
        warnings[2].text,
        'Unexpected invalid media query "(min-width >= 60em)" (media-query-no-invalid)',
        "correct warning text"
      );
      t.is(
        warnings[3].text,
        'Unexpected duplicate selector "a", first used at line 1 (no-duplicate-selectors)',
        "correct warning text"
      );
      t.is(
        warnings[4].text,
        "Expected empty line before rule (rule-empty-line-before)",
        "correct warning text"
      );
    });
});
