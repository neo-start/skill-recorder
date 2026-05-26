#!/usr/bin/env bash
# human-record.sh — per-task recording helper for the Skill Recorder eval Human arm.
#
# Wraps reset / browser-open / file-pickup around an extension-driven SKILL.md
# recording session so the operator only has to focus on demonstrating the task.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_DIR="$REPO_ROOT/eval/skills/human"
DOWNLOADS_DIR="$HOME/Downloads/skill-recorder-skills"
BASE_URL="http://localhost:7780"

# Numeric-ascending task order. Used by --status and --all.
TASK_IDS="423 453 458 470 496 538 694 699 704 771"

# ----- colors -------------------------------------------------------------

if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
    C_BOLD="$(tput bold)"
    C_DIM="$(tput dim)"
    C_RED="$(tput setaf 1)"
    C_GREEN="$(tput setaf 2)"
    C_YELLOW="$(tput setaf 3)"
    C_RESET="$(tput sgr0)"
else
    C_BOLD=""
    C_DIM=""
    C_RED=""
    C_GREEN=""
    C_YELLOW=""
    C_RESET=""
fi

# ----- task table ---------------------------------------------------------

task_suffix() {
    case "$1" in
        423) echo "/admin" ;;
        453) echo "/admin" ;;
        458) echo "/admin/catalog/product/edit/id/1481/" ;;
        470) echo "/admin" ;;
        496) echo "/admin" ;;
        538) echo "/admin" ;;
        694) echo "/admin" ;;
        699) echo "/admin" ;;
        704) echo "/admin" ;;
        771) echo "/admin" ;;
        *) return 1 ;;
    esac
}

task_difficulty() {
    case "$1" in
        423) echo "hard" ;;
        453) echo "easy" ;;
        458) echo "medium" ;;
        470) echo "easy" ;;
        496) echo "medium" ;;
        538) echo "medium" ;;
        694) echo "hard" ;;
        699) echo "hard" ;;
        704) echo "medium" ;;
        771) echo "medium" ;;
        *) return 1 ;;
    esac
}

task_intent() {
    case "$1" in
        423) echo "Mark all Hollister shirts on sale." ;;
        453) echo "Disable Teton pullover hoodie from the site, they are facing some quality issues." ;;
        458) echo "Reduce the price of this product by \$5." ;;
        470) echo "Cancel order 302." ;;
        496) echo "Update order #299 with the Federal Express tracking number 8974568499." ;;
        538) echo "Modify the address of order #299 to 456 Oak Avenue, Apartment 5B, New York, NY, 10001." ;;
        694) echo "Add a simple product named Energy-Bulk Women Shirt with 50 in stock, available in size S and color blue, priced at \$60." ;;
        699) echo "Draft a new marketing price rule for spring sale that offers a 20 percent discount site-wide for all customers." ;;
        704) echo "Today is 3/15/2023, generate a sales order report for last month." ;;
        771) echo "Approve the positive reviews to display in our store." ;;
        *) return 1 ;;
    esac
}

task_exists() {
    [ -f "$TARGET_DIR/webarena.$1.SKILL.md" ]
}

list_unrecorded() {
    local id
    for id in $TASK_IDS; do
        if ! task_exists "$id"; then
            echo "$id"
        fi
    done
}

# ----- argument parsing ---------------------------------------------------

usage() {
    cat <<EOF
Usage: human-record.sh <task_id>      Record one task interactively
       human-record.sh --status       Show recording progress
       human-record.sh --all          Walk through every UNRECORDED task
       human-record.sh --help         Show this message

<task_id> may be a bare numeric id (e.g. 453) or the full form (webarena.453).
Known task ids: $TASK_IDS

Repo root: $REPO_ROOT
Target dir: $TARGET_DIR
Downloads dir: $DOWNLOADS_DIR
EOF
}

err() {
    printf '%s%s%s\n' "$C_RED" "$*" "$C_RESET" >&2
}

warn() {
    printf '%s%s%s\n' "$C_YELLOW" "$*" "$C_RESET" >&2
}

# Normalize the task-id argument. Accepts "453" or "webarena.453".
# Prints the bare numeric id on stdout; returns 1 if unknown.
normalize_task_id() {
    local raw="$1"
    local id="${raw#webarena.}"
    case " $TASK_IDS " in
        *" $id "*) echo "$id" ;;
        *) return 1 ;;
    esac
}

# ----- status ------------------------------------------------------------

cmd_status() {
    local id intent diff mark count=0 total=0
    for id in $TASK_IDS; do
        total=$((total + 1))
        diff="$(task_difficulty "$id")"
        intent="$(task_intent "$id")"
        if task_exists "$id"; then
            mark="${C_GREEN}${C_RESET}"
            count=$((count + 1))
        else
            mark=" "
        fi
        # Trim intent to 50 chars
        local short
        short="$(printf '%s' "$intent" | cut -c1-50)"
        printf 'webarena.%s  %-6s  %s  %s\n' "$id" "$diff" "$mark" "$short"
    done
    printf '\n%s%d/%d recorded%s\n' "$C_BOLD" "$count" "$total" "$C_RESET"
}

# ----- file pickup -------------------------------------------------------

# Find the newest *.SKILL.md in $DOWNLOADS_DIR. Prints absolute path on stdout.
# Returns 1 (with an error already printed to stderr) if directory missing or no file.
pick_latest_skill() {
    if [ ! -d "$DOWNLOADS_DIR" ]; then
        err "Downloads directory not found: $DOWNLOADS_DIR"
        err ""
        err "The Skill Recorder Chrome extension is configured to save into"
        err "$HOME/Downloads/skill-recorder-skills/ via saveAs:false."
        err ""
        err "Check Chrome download settings at chrome://settings/downloads"
        err "and make sure \"Ask where to save each file before downloading\" is OFF."
        return 1
    fi

    local newest
    newest="$(find "$DOWNLOADS_DIR" -name '*.SKILL.md' -type f -print0 2>/dev/null \
        | xargs -0 stat -f '%m %N' 2>/dev/null \
        | sort -rn \
        | head -n 1 \
        | sed -E 's/^[0-9]+ //')"

    if [ -z "$newest" ]; then
        err "No *.SKILL.md files found in $DOWNLOADS_DIR"
        err ""
        err "Make sure the Chrome extension actually downloaded a file."
        err "Check Chrome download settings at chrome://settings/downloads —"
        err "\"Ask where to save each file before downloading\" must be OFF."
        return 1
    fi

    # Warn if older than 10 minutes (600s)
    local mtime now age
    mtime="$(stat -f '%m' "$newest")"
    now="$(date +%s)"
    age=$((now - mtime))
    if [ "$age" -gt 600 ]; then
        warn ""
        warn "Newest *.SKILL.md is ${age}s old (>600s); did the extension really save a new file?"
        warn "Proceeding anyway: $newest"
    fi

    printf '%s\n' "$newest"
}

# Validate YAML frontmatter has a name: field in the first ~30 lines.
# Args: $1 = path
validate_skill_md() {
    local path="$1"
    local first_nonempty
    first_nonempty="$(awk 'NF { print; exit }' "$path")"
    if [ "$first_nonempty" != "---" ]; then
        err "Validation failed: first non-empty line is not '---' (got: '$first_nonempty')"
        err "First 20 lines of $path:"
        awk 'NR<=20 { printf "  %s\n", $0 } NR>20 { exit }' "$path" >&2
        return 1
    fi
    if ! awk 'NR<=30 && /^name:[[:space:]]*[^[:space:]]/ { found=1; exit } END { exit !found }' "$path"; then
        err "Validation failed: no 'name: <value>' line found in first 30 lines."
        err "First 20 lines of $path:"
        awk 'NR<=20 { printf "  %s\n", $0 } NR>20 { exit }' "$path" >&2
        return 1
    fi
    return 0
}

# ----- per-task interactive flow ----------------------------------------

record_one() {
    local id="$1"
    local suffix intent diff start_url target_path
    suffix="$(task_suffix "$id")"
    intent="$(task_intent "$id")"
    diff="$(task_difficulty "$id")"
    start_url="${BASE_URL}${suffix}"
    target_path="$TARGET_DIR/webarena.${id}.SKILL.md"

    # Header
    printf '\n%s========================================%s\n' "$C_BOLD" "$C_RESET"
    printf '%s[webarena.%s] %s  (%s)%s\n' "$C_BOLD" "$id" "$intent" "$diff" "$C_RESET"
    printf '%sStart URL:%s %s\n' "$C_DIM" "$C_RESET" "$start_url"
    printf '%sTarget:%s    %s\n' "$C_DIM" "$C_RESET" "$target_path"
    printf '%s========================================%s\n\n' "$C_BOLD" "$C_RESET"

    # 1. Reset Magento
    local reset_script="$REPO_ROOT/eval/docker/setup-webarena.sh"
    if [ ! -x "$reset_script" ] && [ ! -f "$reset_script" ]; then
        err "Setup script not found: $reset_script"
        return 1
    fi
    printf '%sResetting shopping_admin via setup-webarena.sh ...%s ' "$C_DIM" "$C_RESET"
    if bash "$reset_script" reset shopping_admin >/dev/null 2>&1; then
        printf '%sdone%s\n' "$C_GREEN" "$C_RESET"
    else
        printf '%sFAILED%s\n' "$C_RED" "$C_RESET"
        err "setup-webarena.sh reset shopping_admin exited non-zero."
        err "Re-run that command directly to see its output:"
        err "  bash \"$reset_script\" reset shopping_admin"
        return 1
    fi

    # 2. Open browser
    mkdir -p "$TARGET_DIR"
    printf '%sOpening %s ...%s\n' "$C_DIM" "$start_url" "$C_RESET"
    open "$start_url"

    # 3. Block on user
    printf '\n%sPress ENTER once you have saved the SKILL.md from the extension (Ctrl-C to abort)...%s' \
        "$C_BOLD" "$C_RESET"
    read -r _

    # 4. Pick up file
    local src
    if ! src="$(pick_latest_skill)"; then
        return 1
    fi

    # 5. Validate
    if ! validate_skill_md "$src"; then
        return 1
    fi

    # 6. Copy
    cp -f "$src" "$target_path"

    # 7. Summary
    local bytes steps src_basename
    bytes="$(stat -f '%z' "$target_path")"
    steps="$(grep -c '^### ' "$target_path" || true)"
    src_basename="$(basename "$src")"

    printf '\n%sRecorded webarena.%s%s\n' "$C_GREEN" "$id" "$C_RESET"
    printf '  Saved:   %s\n' "$target_path"
    printf '  Size:    %s bytes\n' "$bytes"
    printf '  Steps:   %s (### headings)\n' "$steps"
    printf '  Source:  %s\n' "$src_basename"
    printf '\n'
}

# ----- --all flow --------------------------------------------------------

cmd_all() {
    local pending
    pending="$(list_unrecorded)"
    if [ -z "$pending" ]; then
        printf '%sAll 10 tasks already recorded. Nothing to do.%s\n' "$C_GREEN" "$C_RESET"
        return 0
    fi

    local count
    count="$(printf '%s\n' "$pending" | wc -l | tr -d ' ')"
    printf '%s%s task(s) pending:%s %s\n\n' "$C_BOLD" "$count" "$C_RESET" "$(echo $pending | tr '\n' ' ')"

    local id reply
    for id in $pending; do
        record_one "$id"
        # Skip the prompt if this was the last pending task
        local still
        still="$(list_unrecorded)"
        if [ -z "$still" ]; then
            printf '%sAll tasks recorded.%s\n' "$C_GREEN" "$C_RESET"
            break
        fi
        printf '%sContinue with next task? [Y/n]%s ' "$C_BOLD" "$C_RESET"
        read -r reply || reply=""
        case "$reply" in
            n|N|no|NO)
                printf '%sAborted by user.%s\n' "$C_DIM" "$C_RESET"
                return 0
                ;;
            *) ;;
        esac
    done
}

# ----- dispatch ----------------------------------------------------------

main() {
    if [ "$#" -lt 1 ]; then
        usage >&2
        exit 64
    fi

    case "$1" in
        -h|--help)
            usage
            exit 0
            ;;
        --status)
            cmd_status
            exit 0
            ;;
        --all)
            cmd_all
            exit 0
            ;;
        --*)
            err "Unknown flag: $1"
            usage >&2
            exit 64
            ;;
        *)
            local id
            if ! id="$(normalize_task_id "$1")"; then
                err "Unknown task id: $1"
                err "Known ids: $TASK_IDS"
                usage >&2
                exit 64
            fi
            record_one "$id"
            exit 0
            ;;
    esac
}

main "$@"
