// RF rows 304-305 verify this section at 4 m and 6 m lengths.
// Do not infer developed width from height and flange alone.
export function verifiedPurlinWidth(values) {
  return (values.purlinType ?? 'Z') === 'Z'
    && Number(values.thickness) === 1.9
    && Number(values.height) === 200
    && Number(values.flange) === 75 ? 375 : null
}
