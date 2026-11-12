import { test, expect } from '@playwright/test'

async function choose(page, group, name) {
  await page.getByRole('button', { name: group, exact: true }).click()
  await page.locator('.material-option').filter({ has: page.getByText(name, { exact: true }) }).click()
}
async function fill(page, values) {
  for (const [id, value] of Object.entries(values)) await page.locator(`#${id}`).fill(value)
}
const cases = [
  ['Plates', 'MS Plate', { thickness: '5.5', width: '4', length: '12' }, '192.54', 'MS PLATE 5.5MM X 4FT X 12FT'],
  ['Plates', 'Checkered Plate', { thickness: '2', width: '4', length: '8', quantity: '3' }, '140.03', 'CHECKERED PLATE 2MM X 4FT X 8FT'],
  ['Plates', 'Base Plate', { thickness: '12', width: '300', length: '300', quantity: '2' }, '16.96', 'BASE PLATE 12MM X 300MM X 300MM'],
  ['Plates', 'Base Plate (inches)', { thickness: '25', width: '12', length: '16', quantity: '2' }, '48.62', 'BASE PLATE 25MM X 12IN X 16IN'],
  ['Plates', 'Triangle Plate', { thickness: '10', width: '150', length: '200', quantity: '36' }, '42.39', 'TRIANGLE PLATE 10MM X 150MM X 200MM'],
  ['Plates', 'Round Plate', { thickness: '3', diameter: '150', quantity: '10' }, '4.16', 'ROUND PLATE 3MM X 150MM'],
  ['Bars & sections', 'Flat Bar', { thickness: '8', width: '3.34', length: '6' }, '32.01', 'FLAT BAR 8MM X 3.34IN X 6M'],
  ['Bars & sections', 'Wide Flange (lb/ft)', { rating: '16', length: '6' }, '142.83', 'WIDE FLANGE 16LB/FT X 6M'],
  ['Bars & sections', 'Wide Flange (kg/m)', { rating: '16.9', length: '2.3' }, '38.87', 'WIDE FLANGE 16.9KG/M X 2.3M'],
  ['Bars & sections', 'Channel Bar', { rating: '6.92', length: '6' }, '41.52', 'CHANNEL BAR 6.92KG/M X 6M'],
  ['Bars & sections', 'Angle Bar', { thickness: '6', width1: '50', width2: '50', length: '6' }, '26.56', 'ANGLE BAR 6MM X 50MM X 50MM X 6M'],
  ['Bars & sections', 'Roll Form', { thickness: '1.1', width: '202', length: '6' }, '10.48', 'ROLL FORM 1.1MM X 202MM X 6M'],
  ['Bars & sections', 'Sheet Pile', { rating: '48', length: '12' }, '576.00', 'SHEET PILE 48KG/M X 12M'],
  ['Pipes & tubes', 'Pipe', { diameter: '33.4', thickness: '3.38', length: '6' }, '15.03', 'PIPE 33.4MM X 3.38MM X 6M'],
  ['Pipes & tubes', 'Tubular', { thickness: '1.5', width1: '25', width2: '25', length: '6' }, '6.65', 'TUBULAR 1.5MM X 25MM X 25MM X 6M'],
  ['Known weight', 'Known kg per piece', { weight: '15.1234', description: 'Supplier bar', quantity: '3' }, '45.37', 'SUPPLIER BAR'],
  ['Known weight', 'Known kg per meter', { rating: '3.2', length: '2.5', description: 'Supplier section', quantity: '3' }, '24.00', 'SUPPLIER SECTION'],
  ['Known weight', 'Tagged batch weight', { weight: '100', description: 'Coils', quantity: '4' }, '100.00', 'COILS'],
]
for (const [group, name, values, expected, itemName] of cases) test(`${name}: workbook result, name, units and reset`, async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await choose(page, group, name)
  await fill(page, values)
  await expect(page.locator('.weight-value')).toHaveText(`${expected} kg`)
  await expect(page.getByLabel('Item Name', { exact: true })).toHaveValue(itemName)
  if (name === 'Flat Bar') {
    await expect(page.locator('#width-unit')).toHaveText('inches')
    await expect(page.locator('#length-unit')).toHaveText('meters')
    await expect(page.getByRole('combobox')).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.locator('.weight-value')).toHaveText('— kg')
  await expect(page.getByLabel('Item Name', { exact: true })).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Copy', exact: true })).toBeDisabled()
  expect(errors).toEqual([])
})
test('copy, invalid input, material switch, decimal lengths and keyboard interaction', async ({ page }) => {
  await page.goto('/')
  await choose(page, 'Bars & sections', 'Flat Bar')
  await fill(page, { thickness: '8', width: '3.34', length: '6' })
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedItemName = text } } }))
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Copied!')
  expect(await page.evaluate(() => window.copiedItemName)).toBe('FLAT BAR 8MM X 3.34IN X 6M')
  await page.locator('#length').fill('3')
  await expect(page.getByRole('status')).toBeEmpty()
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('denied') } })
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('copy it manually')
  await page.locator('#quantity').fill('1.5')
  await expect(page.locator('.weight-value')).toHaveText('— kg')
  await expect(page.getByText('Enter a whole number of pieces.')).toBeVisible()
  await page.locator('#thickness').fill('-2')
  await expect(page.getByRole('button', { name: 'Copy', exact: true })).toBeDisabled()
  await choose(page, 'Bars & sections', 'Wide Flange (kg/m)')
  await expect(page.locator('#rating')).toHaveValue('')
  await page.locator('#rating').fill('10')
  await page.getByRole('button', { name: '6 m', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.weight-value')).toHaveText('60.00 kg')
  await page.getByRole('button', { name: '12 m', exact: true }).click()
  await expect(page.locator('.weight-value')).toHaveText('120.00 kg')
  await page.locator('#length').fill('2.3')
  await expect(page.locator('.weight-value')).toHaveText('23.00 kg')
  await choose(page, 'Pipes & tubes', 'Pipe')
  await fill(page, { diameter: '4', thickness: '2', length: '6' })
  await expect(page.getByText('Thickness must be less than half the outside diameter.')).toBeVisible()
  await expect(page.locator('.weight-value')).toHaveText('— kg')
})
for (const width of [360, 768, 1440]) test(`all groups fit ${width}px viewport`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 })
  await page.goto('/')
  for (const group of ['Plates', 'Bars & sections', 'Pipes & tubes', 'Known weight']) {
    await page.getByRole('button', { name: group, exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
  await choose(page, 'Bars & sections', 'Flat Bar')
  await fill(page, { thickness: '8', width: '3.34', length: '6' })
  await page.screenshot({ path: `test-results/calculator-${width}.png`, fullPage: true })
})

test('converter applies full precision and list snapshots can be edited, copied, exported and printed', async ({ page }) => {
  await page.goto('/')
  await choose(page, 'Bars & sections', 'Flat Bar')
  await fill(page, { thickness: '8', length: '6', quantity: '2' })
  await page.getByText('Need to convert a measurement?', { exact: true }).click()
  await page.getByLabel('Convert for field').selectOption('width')
  await page.getByLabel('Value to convert').fill('84.836')
  await page.getByLabel('Convert from unit').selectOption('mm')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  expect(Number(await page.locator('#width').inputValue())).toBeCloseTo(3.34, 12)
  await expect(page.locator('.weight-value')).toHaveText('64.01 kg')
  await page.getByRole('button', { name: 'Add to list', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.locator('#quantity').fill('3')
  await expect(page.locator('tbody tr td').nth(1)).toHaveText('2')
  await page.getByRole('button', { name: 'Add to list', exact: true }).click()
  await expect(page.locator('.grand-total')).toHaveText('Grand total 160.03 kg')
  await page.getByRole('button', { name: /^Edit FLAT BAR/ }).first().click()
  await page.locator('#quantity').fill('1')
  await page.getByRole('button', { name: 'Update item', exact: true }).click()
  await expect(page.locator('.grand-total')).toHaveText('Grand total 128.03 kg')
  await page.getByRole('button', { name: /^Remove FLAT BAR/ }).last().click()
  await expect(page.locator('.grand-total')).toHaveText('Grand total 32.01 kg')
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedComputation = text } } }))
  await page.getByRole('button', { name: 'Copy computation', exact: true }).click()
  expect(await page.evaluate(() => window.copiedComputation)).toContain('Total weight: 32.01 kg')
  await page.getByRole('button', { name: 'Copy list', exact: true }).click()
  expect(await page.evaluate(() => window.copiedComputation)).toContain('Grand total: 32.01 kg')
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('steel-weight-computation.csv')
  const { readFileSync } = await import('node:fs')
  const csv = readFileSync(await download.path(), 'utf8')
  expect(csv).toContain('Grand total')
  expect(csv).toContain('32.00692608')
  await page.evaluate(() => { window.print = () => { window.printRequested = true } })
  await page.getByRole('button', { name: 'Print', exact: true }).click()
  expect(await page.evaluate(() => window.printRequested)).toBe(true)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.topbar')).toBeHidden()
  await expect(page.locator('.workspace')).toBeHidden()
  await expect(page.locator('.computation-list')).toBeVisible()
  await page.emulateMedia({ media: 'screen' })
  await page.reload()
  await expect(page.locator('tbody tr')).toHaveCount(0)
  await page.getByRole('button', { name: 'Known weight', exact: true }).click()
  await expect(page.getByText('Catalogue Item', { exact: true })).toHaveCount(0)
  await expect(page.getByText(/USN/)).toHaveCount(0)
})

test('paste message previews mixed units and applies only the selected line', async ({ page }) => {
  await page.goto('/')
  await fill(page, { thickness: '5.5', width: '4', length: '12', quantity: '3' })
  await page.getByText('Paste measurement from a message', { exact: true }).click()
  await page.getByLabel('Paste one item per line').fill("morning po\nMS PLATE 2.0mm x 4' x 7.2m=137.81kls\nMS PLATE 1.9mm x 4' x 7.2m=130.92kls\nusn 1A108")
  await expect(page.getByRole('article', { name: 'Preview line 2' })).toContainText('137.82 kg / piece')
  await expect(page.getByRole('article', { name: 'Preview line 2' })).toContainText('+0.01 kg')
  await expect(page.locator('#length')).toHaveValue('12')
  await expect(page.locator('#quantity')).toHaveValue('3')
  await page.getByRole('button', { name: 'Apply line 3', exact: true }).click()
  await expect(page.locator('#thickness')).toHaveValue('1.9')
  await expect(page.locator('#width')).toHaveValue('4')
  expect(Number(await page.locator('#length').inputValue())).toBeCloseTo(23.62204724409449, 12)
  await expect(page.locator('#quantity')).toHaveValue('1')
  await expect(page.locator('.weight-value')).toHaveText('130.93 kg')
  await page.getByRole('button', { name: 'Add to list', exact: true }).click()
  await page.getByLabel('Paste one item per line').fill('FLAT BAR 8mm x 3.34in x 6m')
  await page.getByRole('button', { name: 'Apply line 1', exact: true }).click()
  await expect(page.locator('.weight-value')).toHaveText('32.01 kg')
  await expect(page.locator('#length-unit')).toHaveText('meters')
  await expect(page.getByLabel('Item Name', { exact: true })).toHaveValue('FLAT BAR 8MM X 3.34IN X 6M')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByLabel('Paste one item per line').fill('MS PLATE 2 x 4ft x 7.2m')
  await expect(page.locator('.paste-preview .field-error')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Apply line/ })).toHaveCount(0)
  await expect(page.locator('.weight-value')).toHaveText('32.01 kg')
  await page.setViewportSize({ width: 360, height: 1000 })
  await page.getByLabel('Paste one item per line').fill("MS PLATE 2mm x 4' x 7.2m=137.81kls")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/paste-measurement-mobile.png', fullPage: true })
})

test('purlins verified width, manual fallback and profile changes', async ({ page }) => {
  await page.goto('/');
  await choose(page, 'Bars & sections', 'Purlins');
  await fill(page, { thickness: '1.9', height: '200', flange: '75', length: '7.2' });
  await expect(page.locator('#developedWidth')).toHaveValue('375');
  await expect(page.locator('#developedWidth')).toHaveAttribute('readonly', '');
  await expect(page.locator('.weight-value')).toHaveText('40.32 kg');
  await expect(page.getByLabel('Item Name', { exact: true })).toHaveValue('Z-PURLIN 1.9MM X 200MM X 75MM X 7.2M');
  await page.locator('#thickness').fill('2');
  await expect(page.locator('#developedWidth')).toHaveValue('');
  await expect(page.locator('.weight-value')).toHaveText('\u2014 kg');
  await page.locator('#developedWidth').fill('375');
  await expect(page.locator('.weight-value')).toHaveText('42.44 kg');
  await page.locator('#quantity').fill('2');
  await expect(page.locator('.weight-value')).toHaveText('84.89 kg');
  await page.locator('#purlinType').selectOption('C');
  await expect(page.locator('#developedWidth')).toHaveValue('');
  await expect(page.locator('.weight-value')).toHaveText('\u2014 kg');
  await page.locator('#developedWidth').fill('380');
  await expect(page.locator('.weight-value')).toHaveText('86.02 kg');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('#developedWidth')).toHaveValue('');
});

test('flat bar and GI sheet supplied message formats apply', async ({ page }) => {
 await page.goto('/');
 await page.getByText('Paste measurement from a message', { exact: true }).click();
 await page.getByLabel('Paste one item per line').fill("FLAT BAR 20MM X 70MM X 6M - 66.88\nGI SHEET 2.5MM X 4' X 9.57' = 69.79");
 await expect(page.getByRole('article', { name: 'Preview line 1' })).toContainText('66.02 kg / piece');
 await expect(page.getByRole('article', { name: 'Preview line 1' })).toContainText('66.88 kg');
 await page.getByRole('button', { name: 'Apply line 1', exact: true }).click();
 expect(Number(await page.locator('#width').inputValue())).toBeCloseTo(70 / 25.4, 12);
 await expect(page.locator('.weight-value')).toHaveText('66.02 kg');
 await page.getByRole('button', { name: 'Apply line 2', exact: true }).click();
 await expect(page.locator('#plateType')).toHaveValue('GI SHEET');
 await expect(page.locator('.weight-value')).toHaveText('69.79 kg');
 await expect(page.getByLabel('Item Name', { exact: true })).toHaveValue('GI SHEET 2.5MM X 4FT X 9.57FT');
});
