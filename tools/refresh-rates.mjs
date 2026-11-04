// Обновляет api/rates-snapshot.json курсом с platiauto.ru (запускается GitHub Actions раз в час).
import { writeFile } from 'node:fs/promises';
const currencies = ['USD', 'EUR', 'CNY', 'AED', 'KGS', 'KZT', 'KRW', 'JPY'];
const html = await (await fetch('https://platiauto.ru/', { headers: { 'User-Agent': 'PlatiRealty-Preview/1.0' } })).text();
const rates = JSON.parse(html.match(/(?:var|const|let)\s+RATES\s*=\s*(\{[^;]+\})\s*;/)?.[1] ?? 'null');
const rateDate = html.match(/Курс на\s+(\d{2}\.\d{2}\.\d{4})/)?.[1];
if (!rates || !rateDate || !currencies.every(c => rates[c] > 0)) throw new Error('Rates not found on platiauto.ru');
const body = JSON.stringify({ rates, rateDate, fetchedAt: new Date().toISOString(), source: 'https://platiauto.ru/' });
// Сайт сначала спрашивает api/rates.php (на хостинге с PHP это живой курс), здесь по тому же адресу лежит снимок.
for (const file of ['rates-snapshot.json', 'rates.php']) await writeFile(new URL(`../api/${file}`, import.meta.url), body);
