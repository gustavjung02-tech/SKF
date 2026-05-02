# Price Coverage Mapping Criteria

Tai lieu nay dinh nghia bo tieu chi doi chieu de tra loi cau hoi:
"Sau khi nhap nguon gia moi thi coverage ma co gia tang duoc bao nhieu phan tram?"

## 1. Mapping Rule (bat buoc)

1. Code field priority: `normalizedCode` -> `code` -> `sku`
2. Normalize code:
- Uppercase
- Remove ky tu khong nam trong `[A-Z0-9]`
- Neu code ket thuc bang token `SKF` thi cat token do o cuoi
3. Price field priority: `price` -> `priceVnd`
4. Normalize price:
- Parse so tu chuoi
- Chi nhan gia tri `> 0`
- Gia tri null/0/khong parse duoc => xem la khong co gia
5. Deduplicate:
- Key theo `normalizedCode`
- Neu trung key, ban ghi sau ghi de

## 2. Coverage Formula

Ky hieu:
- `U`: tap ma chuan trong catalog (`public/data/skf-code-index.json`)
- `B`: tap ma trong baseline price master co gia hop le (`data_SP/pricing/skf-price-master-bacdanskf.json`)
- `S`: tap ma gia hop le tu nguon bo sung sau normalize
- `M`: tap ma du kien co gia sau merge = `(B ∪ S) ∩ U`

Chi so:
- `Baseline coverage (%) = |B ∩ U| / |U| * 100`
- `Projected coverage (%) = |M| / |U| * 100`
- `Coverage gain (point) = Projected - Baseline`
- `Relative gain on baseline (%) = |M - B| / |B ∩ U| * 100`

## 3. Pass/Fail Standard

### PASS
Dat dong thoi 4 dieu kien:
1. `mappingSuccessRate >= 85%`
2. `validPriceRate >= 70%`
3. `sourceOutsideCatalogRate <= 45%`
4. `newCoveragePointGain >= 2.0`

### CONDITIONAL_PASS
Dat 3/4 dieu kien tren.

### FAIL
Dat < 3 dieu kien.

## 4. Script thuc thi trong repo

Script: `scripts/skf/compare-price-coverage.mjs`

Vi du chay voi nguon duoc de xuat:

```powershell
node scripts/skf/compare-price-coverage.mjs --sourceDir "F:\1_A_Disk_D\Khương Bình\Web-SKF\data-skf"
```

Script tra ve JSON report gom:
- `sourceStats` (tong ban ghi, mapping thanh cong, gia hop le...)
- `metrics` (baseline/projected/gain...)
- `passFail` (PASS/CONDITIONAL_PASS/FAIL)
- `sampleNewCovered` (mau ma duoc bo sung gia moi)

## 5. Operational Rule

1. Chi merge khi ket qua it nhat `CONDITIONAL_PASS`.
2. Neu `sourceOutsideCatalogRate` cao, can loc nhom danh muc truoc khi merge chinh thuc.
3. Sau merge luon chay lai script de xac nhan coverage thuc te.

## 6. Dry-run Va Merge That

### Dry-run xuat danh sach ma moi duoc bo sung gia

```powershell
node scripts/skf/export-price-diff-dry-run.mjs --sourceDir "F:\1_A_Disk_D\Khương Bình\Web-SKF\data-skf"
```

File ket qua:
- `data_SP/reports/price-diff-dry-run.json`
- `data_SP/reports/price-diff-dry-run.csv`

### Merge that vao price master (co backup truoc khi ghi)

```powershell
node scripts/skf/merge-price-master-from-source.mjs --sourceDir "F:\1_A_Disk_D\Khương Bình\Web-SKF\data-skf"
```

File ket qua:
- Backup: `data_SP/pricing/backups/*.backup.json` va `*.backup.csv`
- Price master cap nhat: `data_SP/pricing/skf-price-master-bacdanskf.json` va `.csv`
- Merge report: `data_SP/reports/price-merge-report.json` va `.md`

Mac dinh script chi `fill missing / insert new`, khong ghi de ma da co gia.
Neu can ghi de gia cu, dung them co `--allowOverwrite`.

## 7. Chuan Cau Truc File Dau Vao Cho Cac Lan Update Sau

File JSON moi gui vao chi can dam bao cac truong sau:

### Bat buoc toi thieu
1. `normalizedCode` hoac `code` hoac `sku`
2. `price` hoac `priceVnd`

### Khuyen nghi co them
1. `name`
2. `url` hoac `sourceUrl`
3. `image`
4. `stockStatus`
5. `crawledAt`

### Vi du 1 record hop le

```json
{
	"sku": "6205-2Z-SKF",
	"code": "6205-2Z-SKF",
	"normalizedCode": "62052ZSKF",
	"name": "Vong Bi 6205-2Z SKF",
	"price": "92000",
	"stockStatus": "out_of_stock",
	"url": "https://example.com/6205-2z",
	"image": "https://example.com/6205-2z.jpg",
	"crawledAt": "2026-05-02T10:00:00.000Z"
}
```

### Rule ap vao file dau vao
1. Script se tu cat hau to `SKF` o cuoi ma sau khi normalize.
2. Script se tu parse `price` tu chuoi sang so.
3. Gia `<= 0`, rong, hoac khong parse duoc se bi bo qua.
4. Neu trung `normalizedCode`, ban ghi sau se thay the ban ghi truoc trong nguon input.
