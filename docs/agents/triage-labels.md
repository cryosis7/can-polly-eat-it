# Triage labels

Triage assigns exactly one category role and one state role. This repository uses canonical role
names as local issue values.

## Category

Record the category as `Category: <local value>`.

| Canonical role | Local value | Meaning |
| --- | --- | --- |
| `bug` | `bug` | Existing behaviour is broken |
| `enhancement` | `enhancement` | New feature or improvement |

## State

Record the state as `Status: <local value>`.

| Canonical role | Local value | Meaning |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | Maintainer evaluation is required |
| `needs-info` | `needs-info` | Reporter input is required |
| `ready-for-agent` | `ready-for-agent` | Fully specified for an autonomous agent |
| `ready-for-human` | `ready-for-human` | Human implementation is required |
| `wontfix` | `wontfix` | Will not be actioned |

When a skill names a canonical role, use the corresponding local value from these tables.
