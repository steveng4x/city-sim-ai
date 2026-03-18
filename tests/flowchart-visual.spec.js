import { expect, test } from "@playwright/test";

test.describe("Flowchart Visual Fidelity", () => {
  test("matches expected 1:1 for 3.mmd with D3 hierarchy formatting logic", async ({
    page,
  }) => {
    await page.goto("/#/tools/flowchart");
    await page.waitForLoadState("domcontentloaded");

    const toolbarToggle = page.locator(
      "button[aria-label='Show toolbar'], button[title='Show toolbar'], button:has-text('Show Controls')",
    );
    if ((await toolbarToggle.count()) > 0) {
      await toolbarToggle.first().click();
      await page.waitForTimeout(350);
    }

    const fileSelect = page.locator("[data-testid='flowchart-file-select']:visible");
    await expect(fileSelect).toBeVisible({ timeout: 15_000 });
    // Ensure the option is actually in the DOM before selecting it
    await expect(fileSelect.locator("option[value='3.mmd']")).toBeAttached({ timeout: 15_000 });
    await fileSelect.selectOption("3.mmd");

    const applyFileButton = page.locator("[data-testid='flowchart-apply-file']:visible");
    await applyFileButton.click();

    const formattingLogicSelect = page.locator(
      "[data-testid='flowchart-formatting-logic-select']:visible",
    );
    await expect(formattingLogicSelect).toBeVisible();
    await formattingLogicSelect.selectOption("d3-hierarchy");

    await expect(page.locator(".react-flow__node")).toHaveCount(29, {
      timeout: 20_000,
    });

    const resetViewButton = page.getByRole("button", { name: "Reset View" }).first();
    await resetViewButton.click();
    await page.waitForTimeout(1_000);

    const canvas = page.locator("[data-testid='flowchart-canvas']").first();
    await expect(canvas).toHaveScreenshot("flowchart-3-d3-hierarchy.png", {
      animations: "disabled",
      scale: "css",
      maxDiffPixels: 10,
    });
  });
});
