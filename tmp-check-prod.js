(async function () {
  const base = 'https://skf-congnghiep.info';
  const html = await (await fetch(base + '/tra-ma-bao-gia')).text();
  const re = /_next\/static\/chunks\/app\/\(site\)\/tra-ma-bao-gia\/page-[^"']+\.js/g;
  const ms = html.match(re) || [];
  console.log('routeChunkCount', ms.length);
  if (ms.length) {
    const u = base + ms[0];
    const js = await (await fetch(u)).text();
    console.log('routeChunk', u);
    console.log('has0A223B', js.includes('0A223B'));
    console.log('has3BEmail', js.includes('3B. Gửi Email'));
    console.log('hasArrayFrom', js.includes('Array.from(variantSiblingPool.values())'));
    console.log('hasOpenEmailComposer', js.includes('openEmailComposer'));
    console.log('jsLen', js.length);
  }
})();
