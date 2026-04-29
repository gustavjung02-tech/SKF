# Plan: NTN + Tsubaki Chu Luc Nhat B2B

Chuyen website thanh mat tien so cua THL voi dinh vi ro rang: nha phan phoi chinh thuc vat tu truyen dong cong nghiep, lay NTN va Tsubaki lam hai thuong hieu chu luc cua he danh muc Nhat chinh hang. Huong trien khai uu tien sua truc thong diep va hierarchy thuong hieu truoc, sau do nang visual language sang phong cach Nhat B2B: chuan xac, ky thuat, tiet che, sach, co cam giac corporate industrial thay vi landing page ban hang nhanh.

## Nguyen Tac Trien Khai

- Lam dung theo site dang co va theo phase dang trien khai.
- Khong bi dan boi bo anh SEO da chuan bi san trong `public/images/seo`.
- Uu tien theo dung thu tu: dinh vi THL, cau truc 2 thuong hieu chu luc, copy, visual system, SEO nen.
- Anh rieng theo route la chuyen sau, chi xu ly khi that su khop voi phase trien khai va branding dang dung.

## Steps

1. Pha 1 - Chot dinh vi va loai bo thong diep lam yeu thuong hieu. Thay cac noi dung dang keo site ve huong ca nhan nhu "kenh tu van ca nhan", "By Khuong Binh", "khong phai website chinh thuc cua cong ty" bang thong diep doanh nghiep: THL la nha phan phoi chinh thuc, chuyen cung cap giai phap vat tu truyen dong cong nghiep chinh hang cho nha may. Buoc nay chan toan bo buoc sau.
2. Chuan hoa he ngon ngu thuong hieu trong cau hinh chung. Cap nhat slogan, intro, footer credit, contact framing, metadata nen trong `src/config/site.ts` va cac thanh phan layout de moi diem cham deu dung cung mot giong chuyen nghiep, doanh nghiep, ky thuat. Phu thuoc buoc 1.
3. Pha 2 - Thiet ke lai hierarchy homepage theo mo hinh 2 core brands + 3 supporting brands va khoa cung cau truc nay trong trien khai. Trang chu bat buoc chuyen khoi mo hinh 1 primary brand + 4 secondary brands hien tai; khong chap nhan phuong an giu NTN lam card lon duy nhat. Cau truc muc tieu: 2 brand chu luc NTN va Tsubaki phai dung ngang vai trong cung mot tang uu tien thi giac, dung 2 card chu luc can bang hoac 1 khoi split-brand doi xung; Koyo, NOK, Soho nam o tang phu tro ngay sau do duoi dang 3 supporting cards hoac 1 cum phu ro rang. Phu thuoc buoc 1.
4. Viet lai hero homepage de the hien dong thoi 4 lop gia tri: nha phan phoi chinh thuc, thuong hieu Nhat chinh hang, nang luc ky thuat cong nghiep, toc do phan hoi B2B. Cap nhat headline, subheadline, eyebrow, badge, hero stats, hero flow cards va CTA de nguoi xem hieu ngay day la doanh nghiep phan phoi chinh danh chu khong phai moi gioi hay trang tu van ca nhan. Phu thuoc buoc 3.
5. Pha 3 - Bo sung trust architecture ngay duoi hero. Them mot section xac tin gom cac bang chung nhu phan phoi chinh thuc, danh muc Nhat chinh hang, quy trinh doi chieu ky thuat, kha nang ho tro nha may, khu vuc phuc vu, cam ket nguon goc. Neu co du lieu that, them nam hoat dong, quy mo khach hang, nhom nganh phuc vu hoac anh thuc te kho/doi ngu. Phu thuoc buoc 4.
6. Nang cap du lieu thuong hieu va copy danh muc. Cap nhat `src/data/site-content.ts`, `src/data/home-entry-sections.ts`, `src/data/brand-logos.ts` de NTN va Tsubaki co ngon ngu manh hon ve xuat xu Nhat, vai tro chu luc, loi ich ky thuat, do tin cay van hanh; Koyo, NOK, Soho giu vai tro ho tro ma khong lam loang thong diep chinh. Song song duoc voi buoc 5.
7. Pha 4 - Chuyen visual language sang Nhat B2B ro rang hon. Thay huong dung mau cyan sang va hieu ung marketing bang palette tiet che kieu corporate industrial: navy sau, steel gray, white sach, diem nhan xanh brand co kiem soat. Giam glow mem va cam giac promotional; tang cac mat phang sach, border ro, khoang trang deu, grid chac, iconography ky thuat va nhip chu chat hon. Phu thuoc buoc 3.
8. Cu the hoa visual system de agent thuc hien khong tu suy dien. Hero can cam giac "corporate export / industrial technical"; section titles phai gon, dut khoat; the thuong hieu nen dung logo surface sach, border chinh xac, badge nguon goc Nhat hoac official distributor neu duoc phep; CTA phai nhat quan 1 mau chinh va 1 kieu secondary outline. Phu thuoc buoc 7.
9. Ra typography va density noi dung. Giu cam giac hien dai nhung nghieng ve tai lieu ky thuat doanh nghiep: headline chac, it khau hieu, body copy ngan hon, giam lap lai "tra ma/bao gia"; uu tien thong tin dinh danh, nang luc, ung dung, quy trinh xu ly. Song song duoc voi buoc 7.
10. Pha 5 - Viet lai trang Gioi thieu thanh trang nang luc doanh nghiep. Trang nay phai tra loi duoc: THL la ai, phan phoi chinh thuc nhung thuong hieu nao, phuc vu nhom khach hang nao, quy trinh tiep nhan xu ly nhu cau ra sao, tai sao nha may nen lam viec voi THL. Khong giu bat ky cau nao phu nhan tinh chinh thuc cua doanh nghiep. Phu thuoc buoc 1.
11. Cap nhat footer, header va cac quick actions de dong bo voi dinh vi moi. Footer phai dong vai tro mini corporate profile; header va CTA can giam chat "chat nhanh" thuan ban hang, tang chat "lien he bo phan ky thuat / kinh doanh cong nghiep". Phu thuoc buoc 2 va buoc 7.
12. Pha 6 - Ra SEO va metadata theo dinh vi moi. Title/description trang chu, gioi thieu va nhom san pham can phan anh ro THL la nha phan phoi chinh thuc, NTN + Tsubaki la hai tru cot, danh muc la hang Nhat chinh hang cho nha may. Song song duoc voi buoc 10 va 11.
13. Kiem tra legal va brand accuracy truoc khi publish. Moi claim nhu "nha phan phoi chinh thuc", "chinh hang", cach dung logo, mau thuong hieu, badge xac tin phai dung tai lieu THL va guideline brand dang co. Day la buoc bat buoc cuoi cung.

## Relevant Files

- `src/config/site.ts` - chuan hoa dinh vi doanh nghiep, slogan, credit, quick actions va copy nen toan site.
- `src/data/site-content.ts` - viet lai heroContent, trustBullets, productGroups, support copy, hierarchy NTN/Tsubaki.
- `src/app/(site)/page.tsx` - doi bo cuc homepage sang 2 thuong hieu chu luc, chen trust architecture va visual hierarchy moi.
- `src/components/layout/site-footer.tsx` - chuyen footer thanh corporate footer co trust cues va gioi thieu doanh nghiep.
- `src/components/layout/site-header.tsx` - kiem tra framing logo/menu/action theo dinh vi chinh thuc.
- `src/components/shared/section-title.tsx` - tinh chinh nhip tieu de, eyebrow, khoang cach va cam giac technical corporate.
- `src/app/globals.css` - noi phu hop de chuan hoa mau, spacing, tone nen, border, type rhythm neu can.
- `src/app/(site)/gioi-thieu/page.tsx` - viet lai thanh trang nang luc doanh nghiep/phan phoi chinh thuc.
- `src/data/home-entry-sections.ts` - nang mo ta card NTN/Tsubaki va phan ro supporting brands.
- `src/data/brand-logos.ts` - cap nhat brand descriptions, nhan hien thi va ngu canh logo.
- `src/lib/seo.ts` - kiem tra helper SEO neu can ho tro pattern metadata moi.
- `public/images/branding` va `public/images/brands` - tan dung lai asset hien co, chi mo rong neu that su can them badge hoac hinh ho tro xac tin.

## Mini Visual Spec

- Cau truc bat buoc: 2 primary brands ngang vai o tang dau, 3 supporting brands o tang sau; khong quay lai layout 1 lon + 4 nho.
- Palette uu tien: navy sau, steel gray, white sach; xanh brand chi dung lam accent co kiem soat; han che cyan sang.
- Be mat UI: uu tien mat phang sach, border ro, bong do nhe, giam glow va hieu ung promotional.
- Hero mood: corporate industrial, technical export, Japanese B2B; tranh cam giac sales landing page.
- CTA system: 1 mau CTA chinh, 1 kieu outline secondary; khong dung qua nhieu mau CTA canh tranh nhau.
- Brand cards: logo surface sach, ty le can bang, it hieu ung thua; NTN va Tsubaki phai co trong luong thi giac tuong duong.

## Copy Rules

- Uu tien cac cum: nha phan phoi chinh thuc, thuong hieu Nhat chinh hang, ho tro ky thuat cong nghiep, ung dung nha may, doi chieu ky thuat, cam ket nguon goc.
- Giam lap cac cum: tra ma nhanh, bao gia nhanh, chat nhanh, gui ma ngay neu khong that su can cho CTA chinh.
- Khong dung lai giong ca nhan hoa nhu: kenh tu van ca nhan, by ca nhan, lam viec ca nhan, khong phai website chinh thuc.
- Copy headline phai thien ve nang luc va dinh danh doanh nghiep hon la khau hieu ban hang.
- Copy body ngan, chac, giau thong tin ky thuat; tranh lap y cung mot loi diem qua nhieu section.
- NTN va Tsubaki phai luon duoc mo ta nhu 2 tru cot danh muc; Koyo, NOK, Soho la nhom bo tro theo ung dung.
- Khi dung claim official distributor hoac chinh hang, chi dung o noi phu hop va khong vuot qua tai lieu xac thuc THL dang co.

## Verification

1. Review toan bo homepage, footer, header va trang Gioi thieu de chac khong con copy ca nhan hoa hoac mau thuan voi vi the phan phoi chinh thuc.
2. Kiem tra thu cong tren desktop/mobile: 2 thuong hieu NTN va Tsubaki phai noi bat ngang vai, supporting brands khong lan thong diep chinh.
3. Kiem tra visual consistency: palette, border, typography, CTA, icon, background phai cho cam giac Nhat B2B tiet che thay vi marketing sang mau.
4. Soat title/description cua trang chu, gioi thieu va cac diem vao danh muc de snippet phan anh dung dinh vi official distributor va hang Nhat chinh hang.
5. Neu co dung badge, dau chung thuc hoac logo lon, doi chieu voi guideline thuong hieu va ho so phan phoi truoc khi publish.
6. Sau khi thuc hien, chay lint/build va kiem tra khong co loi layout hoac du lieu tren cac breakpoint chinh.

## Decisions

- Da chot: NTN va Tsubaki la 2 thuong hieu chu luc, xuat hien ngang vai tren homepage theo cau truc khoa cung 2 primary brands + 3 supporting brands.
- Da chot: THL duoc dinh vi la nha phan phoi chinh thuc, khong dung lai giong "kenh tu van ca nhan".
- Da chot: visual refresh di theo phong cach Nhat B2B tiet che, ky thuat, corporate industrial; khong di theo huong neon, bong bay hoac landing page sales.
- Da chot: khong lay bo anh trong `public/images/seo` lam dau vao chinh cho luot trien khai nay; bo anh do chi la tai san chuan bi cho giai doan sau.
- Da chot: uu tien SEO nen phu hop voi site hien tai; anh preview rieng theo route chi xu ly sau khi noi dung, hierarchy va branding da on dinh.
- Khong bao gom trong luot dau: dung bo anh moi, case study moi, testimonial that, scan chung chi hoac thay toan bo design system neu chua co asset va tai lieu xac thuc.

## Further Considerations

1. Neu THL co guideline brand hoac bo nhan dien chinh thuc, agent trien khai nen uu tien bam guideline do thay vi tu chon palette tuong doi.
2. Neu co anh that cua kho, doi ngu, quay ky thuat hoac khu vuc giao nhan, nen uu tien dung o trust section de tang do tin cay hon nhieu so voi chi sua copy.
3. Neu muon day chuan Nhat B2B them mot nac, co the yeu cau luot sau tap trung rieng vao motion, typography va background treatment, nhung chua nen gop vao luot dau neu muc tieu hien tai la chot dinh vi va hierarchy.