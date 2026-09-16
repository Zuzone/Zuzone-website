-- Owner request 2026-09-16: drop "Singapore" from the name. The location field (still "Singapore"
-- vs the owner's "Hong Kong") is a separate open question and is left as is.
UPDATE villages SET name = 'ShanHaiWoo 2026' WHERE id = 'shanhaiwoo-singapore-2026';
