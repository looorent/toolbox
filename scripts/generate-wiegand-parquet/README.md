# Wiegand26 Parquet Generator

## Why

Wiegand26 is a legacy access control protocol that encodes data into 26 bits. When used with ANPR (Automatic Number Plate Recognition) systems, a license plate is hashed into a 26-bit value. This is a lossy process — multiple plates can map to the same Wiegand value (collisions).

Given a Wiegand26 decimal value, there is no mathematical way to reverse it back to the original plate. The only way to find which plates produce a given Wiegand value is to encode every possible plate and check for matches.

## What this script does

This script brute-forces all valid license plates for a country, encodes each one to its Wiegand26 value, and stores the `wiegand → plates` mappings as Parquet files on Cloudflare R2.

These files power the "Decode W26" feature in the Wiegand Converter tool, which looks up a Wiegand value and returns all matching plates for each supported country.

## How it works

1. **Encoding** — Worker threads generate all valid plates for a country in parallel (sliced by plate prefix). Each worker encodes plates using `anpr-wiegand` and streams `[wiegand, plate]` pairs back to the main thread, which writes them into 32 temporary files bucketed by Wiegand range.

2. **Parquet writing** — Each temp file is read one at a time, plates sharing the same Wiegand value are grouped, and a Parquet file is written with SNAPPY compression. This keeps memory usage low (~200 MB peak) even for large countries.

3. **Upload** — Parquet files are uploaded to Cloudflare R2 with concurrent wrangler calls.

## Supported countries

| Country        | Code | Plates        | Format                                                |
|----------------|------|---------------|-------------------------------------------------------|
| Austria        | AT   | 175,760,000   | `LL NNNN L` (2L district + 4D + 1L)                  |
| Belgium        | BE   | 158,184,000   | `D LLL NNN` (1-9, A-Z³, 000-999)                     |
| Bulgaria       | BG   | 175,760,000   | `L NNNN LL` (1L region + 4D + 2L)                    |
| Croatia        | HR   | 175,760,000   | `LL NNNN L` (2L city + 4D + 1L)                      |
| Cyprus         | CY   | 17,576,000    | `LLL NNN` (3L + 3D)                                  |
| Czech Republic | CZ   | 67,600,000    | `N LL NNNN` (1D region + 2L + 4D)                    |
| Denmark        | DK   | 67,600,000    | `LL NNNNN` (2L + 5D)                                 |
| Estonia        | EE   | 17,576,000    | `NNN LLL` (3D + 3L)                                  |
| Finland        | FI   | 17,576,000    | `LLL NNN` (3L + 3D)                                  |
| France         | FR   | 456,976,000   | SIV system: `LL NNN LL`                              |
| Germany        | DE   | 175,742,424   | 2L district + 1L + 1-4 digits                        |
| Greece         | GR   | 175,760,000   | `LLL NNNN` (3L + 4D)                                 |
| Hungary        | HU   | 17,576,000    | `LLL NNN` (3L + 3D)                                  |
| Iceland        | IS   | 676,000       | `LL NNN` (2L + 3D)                                   |
| Ireland        | IE   | 260,000,000   | `NNN L NNNN` (3D year + 1L county + 4D seq)          |
| Italy          | IT   | 456,976,000   | `LL NNN LL` (2L + 3D + 2L)                           |
| Latvia         | LV   | 6,760,000     | `LL NNNN` (2L + 4D)                                  |
| Liechtenstein  | LI   | 99,999        | `FL` + 1-5 digit number                              |
| Lithuania      | LT   | 17,576,000    | `LLL NNN` (3L + 3D)                                  |
| Luxembourg     | LU   | 999,999       | 1 to 999999                                          |
| Malta          | MT   | 17,576,000    | `LLL NNN` (3L + 3D)                                  |
| Netherlands    | NL   | 126,547,200   | Sidecodes 6-9: `99LLLL`, `LL99LL`, `9LLL99`, `L999LL`|
| Norway         | NO   | 67,600,000    | `LL NNNNN` (2L + 5D)                                 |
| Poland         | PL   | 67,600,000    | `LL NNNNN` (2L + 5D)                                 |
| Portugal       | PT   | 45,697,600    | `LL NN LL` (2L + 2D + 2L)                            |
| Romania        | RO   | 456,976,000   | `LL NNN LL` (2L county + 3D + 2L)                    |
| Slovakia       | SK   | 456,976,000   | `LL NNN LL` (2L district + 3D + 2L)                  |
| Slovenia       | SI   | 67,600,000    | `LL NNNNN` (2L + 5D)                                 |
| Spain          | ES   | 175,760,000   | `NNNN LLL` (4D + 3L)                                 |
| Sweden         | SE   | 45,697,600    | `LLL NN L` (3L + 2D + 1L)                            |
| Switzerland    | CH   | 25,999,974    | Canton code (26 cantons) + 1-6 digit number           |
| United Kingdom | GB   | 45,697,600    | `LL NN LL` (2L area + 2D age + 2L)                   |

## Usage

```bash
pnpm run script:generate-wiegand-parquet -- --country BE --upload
pnpm run script:generate-wiegand-parquet -- --country LU --upload --local
pnpm run script:generate-wiegand-parquet -- --help
```
