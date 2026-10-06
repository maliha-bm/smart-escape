import type {
  AppEventKind,
  NodeType,
  NoRouteReason,
  ValidationCode,
  ValidationParams,
} from '@/types/building'

export type Language = 'en' | 'bn'

type Fmt = (p: ValidationParams) => string

export interface Translation {
  languageName: string
  app: {
    title: string
    subtitle: string
    buildingLabel: string
    noBuilding: string
    languageToggle: string
    reset: string
    resetAria: string
    atInitialState: string
    modified: string
  }
  importer: {
    heading: string
    button: string
    hint: string
    loadSample: string
    downloadSample: string
    loaded: (fileName: string) => string
    loading: string
    sampleFailed: string
  }
  start: {
    heading: string
    placeholder: string
    hint: string
    blockedSuffix: string
    mapHint: string
  }
  route: {
    heading: string
    sequence: string
    exit: string
    totalCost: string
    status: string
    corridors: (count: number) => string
    statusFound: string
    statusNoStart: string
    statusNoBuilding: string
    noRoute: string
    startBlocked: string
    startBlockedDetail: (id: string) => string
    noStartDetail: string
    noRouteReasons: Record<NoRouteReason, string>
    from: string
  }
  hazards: {
    heading: string
    description: string
    tabs: { nodes: string; corridors: string; exits: string }
    search: string
    noMatches: string
    block: string
    unblock: string
    close: string
    reopen: string
    blockAria: (id: string) => string
    unblockAria: (id: string) => string
    closeAria: (id: string) => string
    reopenAria: (id: string) => string
    activeCount: (count: number) => string
    noExits: string
  }
  states: {
    normal: string
    open: string
    blocked: string
    closed: string
    selected: string
    route: string
    unusable: string
    start: string
  }
  types: Record<NodeType, string> & { corridor: string }
  map: {
    aria: string
    zoomIn: string
    zoomOut: string
    fit: string
    labels: string
    legend: string
    cost: string
    nodeAria: (label: string, id: string, type: string, state: string) => string
  }
  empty: {
    title: string
    description: string
    steps: [string, string, string, string]
  }
  errors: {
    title: string
    description: string
    dismiss: string
    more: (count: number) => string
    codes: Record<ValidationCode, Fmt>
  }
  statusBar: {
    status: string
    validation: string
    validationOk: string
    validationFailed: (count: number) => string
    validationNone: string
    updates: string
    noUpdates: string
    events: Record<AppEventKind, (target: string) => string>
  }
}

const en: Translation = {
  languageName: 'English',
  app: {
    title: 'Smart Escape',
    subtitle: 'Interactive Evacuation Route Simulator',
    buildingLabel: 'Building',
    noBuilding: 'No building loaded',
    languageToggle: 'Language',
    reset: 'Reset',
    resetAria: 'Reset hazards to the imported initial state',
    atInitialState: 'Initial state',
    modified: 'Modified',
  },
  importer: {
    heading: 'Building data',
    button: 'Import building.json',
    hint: 'Read locally in your browser. Nothing is uploaded.',
    loadSample: 'Load sample',
    downloadSample: 'Download sample JSON',
    loaded: (name) => `Loaded: ${name}`,
    loading: 'Reading file…',
    sampleFailed: 'Could not load the bundled sample file.',
  },
  start: {
    heading: 'Start location',
    placeholder: 'Select a room or junction',
    hint: 'Only unblocked rooms and junctions can be selected.',
    blockedSuffix: 'blocked',
    mapHint: 'Tip: click a room or junction on the map.',
  },
  route: {
    heading: 'Evacuation route',
    sequence: 'Route',
    exit: 'Exit',
    totalCost: 'Total cost',
    status: 'Status',
    corridors: (n) => `${n} ${n === 1 ? 'corridor' : 'corridors'}`,
    statusFound: 'Route available',
    statusNoStart: 'Awaiting start location',
    statusNoBuilding: 'No building loaded',
    noRoute: 'No route available',
    startBlocked: 'Starting location blocked',
    startBlockedDetail: (id) => `${id} is blocked. Unblock it or choose another start location.`,
    noStartDetail: 'Choose a starting room or junction to calculate the lowest-cost route.',
    noRouteReasons: {
      'no-exits': 'This building has no exits.',
      'all-exits-closed': 'All exits are closed.',
      unreachable: 'No open exit can be reached from this location.',
    },
    from: 'From',
  },
  hazards: {
    heading: 'Hazard controls',
    description: 'Changes reroute instantly.',
    tabs: { nodes: 'Nodes', corridors: 'Corridors', exits: 'Exits' },
    search: 'Filter by ID or label',
    noMatches: 'No matches.',
    block: 'Block',
    unblock: 'Unblock',
    close: 'Close',
    reopen: 'Reopen',
    blockAria: (id) => `Block ${id}`,
    unblockAria: (id) => `Unblock ${id}`,
    closeAria: (id) => `Close exit ${id}`,
    reopenAria: (id) => `Reopen exit ${id}`,
    activeCount: (n) => `${n} active`,
    noExits: 'This building has no exits.',
  },
  states: {
    normal: 'Normal',
    open: 'Open',
    blocked: 'Blocked',
    closed: 'Closed',
    selected: 'Selected',
    route: 'On route',
    unusable: 'Unusable',
    start: 'Start',
  },
  types: { room: 'Room', junction: 'Junction', exit: 'Exit', corridor: 'Corridor' },
  map: {
    aria: 'Interactive building map',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fit: 'Fit to view',
    labels: 'Toggle labels',
    legend: 'Legend',
    cost: 'Cost',
    nodeAria: (label, id, type, state) => `${type} ${label} (${id}), ${state}`,
  },
  empty: {
    title: 'Plan a safe way out',
    description: 'Smart Escape computes the lowest-cost evacuation route entirely in your browser.',
    steps: [
      'Import a building.json file (or load the sample).',
      'Select a starting room or junction.',
      'View the lowest-cost evacuation route.',
      'Change hazards to see automatic rerouting.',
    ],
  },
  errors: {
    title: 'The file could not be loaded',
    description: 'Fix the issues below and import the file again.',
    dismiss: 'Dismiss',
    more: (n) => `…and ${n} more issue${n === 1 ? '' : 's'}.`,
    codes: {
      parse_error: (p) => `The file is not valid JSON (${p.message}).`,
      root_not_object: () => 'The top level of the file must be a JSON object.',
      building_missing: () => '"building" is missing or empty.',
      nodes_not_array: () => '"nodes" must be an array.',
      nodes_limit: (p) => `The building must have ${p.min}–${p.max} nodes (found ${p.count}).`,
      node_not_object: (p) => `Node #${Number(p.index) + 1} is not an object.`,
      node_id_invalid: (p) => `Node #${Number(p.index) + 1} has a missing or empty "id".`,
      node_id_duplicate: (p) => `Node ID "${p.id}" is used more than once.`,
      node_label_invalid: (p) => `Node "${p.id}" has a missing or empty "label".`,
      node_type_invalid: (p) => `Node "${p.id}" has invalid type ${p.value} (use room, junction or exit).`,
      node_coord_invalid: (p) => `Node "${p.id}" has a non-numeric "${p.axis}" coordinate (${p.value}).`,
      edges_not_array: () => '"edges" must be an array.',
      edges_limit: (p) => `The building must have ${p.min}–${p.max} edges (found ${p.count}).`,
      edge_not_object: (p) => `Edge #${Number(p.index) + 1} is not an object.`,
      edge_id_invalid: (p) => `Edge #${Number(p.index) + 1} has a missing or empty "id".`,
      edge_id_duplicate: (p) => `Edge ID "${p.id}" is used more than once.`,
      edge_endpoint_missing: (p) => `Edge "${p.id}": "${p.endpoint}" refers to unknown node ${p.node}.`,
      edge_cost_invalid: (p) => `Edge "${p.id}" has invalid cost ${p.value} (must be a positive integer).`,
      edge_self_loop: (p) => `Edge "${p.id}" connects "${p.node}" to itself.`,
      edge_duplicate_pair: (p) => `Edge "${p.id}" repeats the connection ${p.a} ↔ ${p.b} already defined by "${p.other}".`,
      initial_state_invalid: () => '"initial_state" is missing or not an object.',
      initial_list_invalid: (p) => `"initial_state.${p.list}" must be an array.`,
      initial_ref_unknown: (p) => `"initial_state.${p.list}" refers to unknown ID ${p.id}.`,
      blocked_node_wrong_type: (p) => `"${p.id}" is an exit — use closed_exits instead of blocked_nodes.`,
      closed_exit_wrong_type: (p) => `"${p.id}" is a ${p.type}, not an exit — it cannot be in closed_exits.`,
    },
  },
  statusBar: {
    status: 'Status',
    validation: 'Validation',
    validationOk: 'Valid',
    validationFailed: (n) => `${n} issue${n === 1 ? '' : 's'}`,
    validationNone: 'Not imported',
    updates: 'Updates',
    noUpdates: 'No changes yet.',
    events: {
      imported: (t) => `Imported ${t}`,
      'import-failed': (t) => `Import failed: ${t}`,
      reset: () => 'Reset to initial state',
      'start-selected': (t) => `Start set to ${t}`,
      'node-blocked': (t) => `${t} blocked`,
      'node-unblocked': (t) => `${t} unblocked`,
      'edge-blocked': (t) => `Corridor ${t} blocked`,
      'edge-unblocked': (t) => `Corridor ${t} unblocked`,
      'exit-closed': (t) => `Exit ${t} closed`,
      'exit-opened': (t) => `Exit ${t} reopened`,
    },
  },
}

const bn: Translation = {
  languageName: 'বাংলা',
  app: {
    title: 'স্মার্ট এস্কেপ',
    subtitle: 'ইন্টারঅ্যাক্টিভ জরুরি বহির্গমন পথ সিমুলেটর',
    buildingLabel: 'ভবন',
    noBuilding: 'কোনো ভবন লোড করা হয়নি',
    languageToggle: 'ভাষা',
    reset: 'রিসেট',
    resetAria: 'বিপদ অবস্থাকে মূল প্রাথমিক অবস্থায় ফিরিয়ে নিন',
    atInitialState: 'প্রাথমিক অবস্থা',
    modified: 'পরিবর্তিত',
  },
  importer: {
    heading: 'ভবনের ডেটা',
    button: 'building.json ইমপোর্ট করুন',
    hint: 'ফাইলটি আপনার ব্রাউজারেই পড়া হয়। কিছুই আপলোড হয় না।',
    loadSample: 'নমুনা লোড করুন',
    downloadSample: 'নমুনা JSON ডাউনলোড করুন',
    loaded: (name) => `লোড হয়েছে: ${name}`,
    loading: 'ফাইল পড়া হচ্ছে…',
    sampleFailed: 'নমুনা ফাইলটি লোড করা যায়নি।',
  },
  start: {
    heading: 'শুরুর অবস্থান',
    placeholder: 'একটি কক্ষ বা সংযোগস্থল নির্বাচন করুন',
    hint: 'শুধু অবরুদ্ধ নয় এমন কক্ষ ও সংযোগস্থল নির্বাচন করা যাবে।',
    blockedSuffix: 'অবরুদ্ধ',
    mapHint: 'টিপ: ম্যাপে কোনো কক্ষ বা সংযোগস্থলে ক্লিক করুন।',
  },
  route: {
    heading: 'বহির্গমন পথ',
    sequence: 'পথ',
    exit: 'বহির্গমন',
    totalCost: 'মোট খরচ',
    status: 'অবস্থা',
    corridors: (n) => `${n}টি করিডোর`,
    statusFound: 'পথ পাওয়া গেছে',
    statusNoStart: 'শুরুর অবস্থানের অপেক্ষায়',
    statusNoBuilding: 'কোনো ভবন লোড করা হয়নি',
    noRoute: 'কোনো পথ উপলব্ধ নেই',
    startBlocked: 'শুরুর অবস্থান অবরুদ্ধ',
    startBlockedDetail: (id) => `${id} অবরুদ্ধ। এটি মুক্ত করুন অথবা অন্য শুরুর অবস্থান বেছে নিন।`,
    noStartDetail: 'সর্বনিম্ন খরচের পথ হিসাব করতে একটি শুরুর কক্ষ বা সংযোগস্থল বেছে নিন।',
    noRouteReasons: {
      'no-exits': 'এই ভবনে কোনো বহির্গমন নেই।',
      'all-exits-closed': 'সব বহির্গমন বন্ধ।',
      unreachable: 'এই অবস্থান থেকে কোনো খোলা বহির্গমনে পৌঁছানো যায় না।',
    },
    from: 'শুরু',
  },
  hazards: {
    heading: 'বিপদ নিয়ন্ত্রণ',
    description: 'পরিবর্তন করলেই পথ সাথে সাথে পুনঃনির্ধারিত হয়।',
    tabs: { nodes: 'নোড', corridors: 'করিডোর', exits: 'বহির্গমন' },
    search: 'আইডি বা নাম দিয়ে খুঁজুন',
    noMatches: 'কিছু পাওয়া যায়নি।',
    block: 'অবরুদ্ধ করুন',
    unblock: 'মুক্ত করুন',
    close: 'বন্ধ করুন',
    reopen: 'আবার খুলুন',
    blockAria: (id) => `${id} অবরুদ্ধ করুন`,
    unblockAria: (id) => `${id} মুক্ত করুন`,
    closeAria: (id) => `বহির্গমন ${id} বন্ধ করুন`,
    reopenAria: (id) => `বহির্গমন ${id} আবার খুলুন`,
    activeCount: (n) => `${n}টি সক্রিয়`,
    noExits: 'এই ভবনে কোনো বহির্গমন নেই।',
  },
  states: {
    normal: 'স্বাভাবিক',
    open: 'খোলা',
    blocked: 'অবরুদ্ধ',
    closed: 'বন্ধ',
    selected: 'নির্বাচিত',
    route: 'পথে',
    unusable: 'অব্যবহারযোগ্য',
    start: 'শুরু',
  },
  types: { room: 'কক্ষ', junction: 'সংযোগস্থল', exit: 'বহির্গমন', corridor: 'করিডোর' },
  map: {
    aria: 'ইন্টারঅ্যাক্টিভ ভবন ম্যাপ',
    zoomIn: 'জুম ইন',
    zoomOut: 'জুম আউট',
    fit: 'পুরো ম্যাপ দেখুন',
    labels: 'লেবেল দেখান/লুকান',
    legend: 'নির্দেশিকা',
    cost: 'খরচ',
    nodeAria: (label, id, type, state) => `${type} ${label} (${id}), ${state}`,
  },
  empty: {
    title: 'নিরাপদে বের হওয়ার পরিকল্পনা করুন',
    description: 'স্মার্ট এস্কেপ সম্পূর্ণ আপনার ব্রাউজারেই সর্বনিম্ন খরচের বহির্গমন পথ হিসাব করে।',
    steps: [
      'একটি building.json ফাইল ইমপোর্ট করুন (অথবা নমুনা লোড করুন)।',
      'একটি শুরুর কক্ষ বা সংযোগস্থল নির্বাচন করুন।',
      'সর্বনিম্ন খরচের বহির্গমন পথ দেখুন।',
      'বিপদ পরিবর্তন করে স্বয়ংক্রিয় পুনঃনির্ধারণ দেখুন।',
    ],
  },
  errors: {
    title: 'ফাইলটি লোড করা যায়নি',
    description: 'নিচের সমস্যাগুলো ঠিক করে আবার ফাইলটি ইমপোর্ট করুন।',
    dismiss: 'বন্ধ করুন',
    more: (n) => `…আরও ${n}টি সমস্যা।`,
    codes: {
      parse_error: (p) => `ফাইলটি বৈধ JSON নয় (${p.message})।`,
      root_not_object: () => 'ফাইলের শীর্ষ স্তর অবশ্যই একটি JSON অবজেক্ট হতে হবে।',
      building_missing: () => '"building" অনুপস্থিত বা খালি।',
      nodes_not_array: () => '"nodes" অবশ্যই একটি অ্যারে হতে হবে।',
      nodes_limit: (p) => `ভবনে ${p.min}–${p.max}টি নোড থাকতে হবে (পাওয়া গেছে ${p.count}টি)।`,
      node_not_object: (p) => `নোড #${Number(p.index) + 1} একটি অবজেক্ট নয়।`,
      node_id_invalid: (p) => `নোড #${Number(p.index) + 1}-এর "id" অনুপস্থিত বা খালি।`,
      node_id_duplicate: (p) => `নোড আইডি "${p.id}" একাধিকবার ব্যবহৃত হয়েছে।`,
      node_label_invalid: (p) => `নোড "${p.id}"-এর "label" অনুপস্থিত বা খালি।`,
      node_type_invalid: (p) => `নোড "${p.id}"-এর ধরন ${p.value} অবৈধ (room, junction বা exit ব্যবহার করুন)।`,
      node_coord_invalid: (p) => `নোড "${p.id}"-এর "${p.axis}" স্থানাঙ্ক সংখ্যা নয় (${p.value})।`,
      edges_not_array: () => '"edges" অবশ্যই একটি অ্যারে হতে হবে।',
      edges_limit: (p) => `ভবনে ${p.min}–${p.max}টি এজ থাকতে হবে (পাওয়া গেছে ${p.count}টি)।`,
      edge_not_object: (p) => `এজ #${Number(p.index) + 1} একটি অবজেক্ট নয়।`,
      edge_id_invalid: (p) => `এজ #${Number(p.index) + 1}-এর "id" অনুপস্থিত বা খালি।`,
      edge_id_duplicate: (p) => `এজ আইডি "${p.id}" একাধিকবার ব্যবহৃত হয়েছে।`,
      edge_endpoint_missing: (p) => `এজ "${p.id}": "${p.endpoint}" অজানা নোড ${p.node} নির্দেশ করে।`,
      edge_cost_invalid: (p) => `এজ "${p.id}"-এর খরচ ${p.value} অবৈধ (ধনাত্মক পূর্ণসংখ্যা হতে হবে)।`,
      edge_self_loop: (p) => `এজ "${p.id}" নোড "${p.node}"-কে নিজের সাথেই যুক্ত করে।`,
      edge_duplicate_pair: (p) => `এজ "${p.id}" সংযোগ ${p.a} ↔ ${p.b} পুনরাবৃত্তি করে, যা "${p.other}" আগেই নির্ধারণ করেছে।`,
      initial_state_invalid: () => '"initial_state" অনুপস্থিত বা অবজেক্ট নয়।',
      initial_list_invalid: (p) => `"initial_state.${p.list}" অবশ্যই একটি অ্যারে হতে হবে।`,
      initial_ref_unknown: (p) => `"initial_state.${p.list}" অজানা আইডি ${p.id} নির্দেশ করে।`,
      blocked_node_wrong_type: (p) => `"${p.id}" একটি বহির্গমন — blocked_nodes-এর বদলে closed_exits ব্যবহার করুন।`,
      closed_exit_wrong_type: (p) => `"${p.id}" বহির্গমন নয় (${p.type}) — এটি closed_exits-এ থাকতে পারে না।`,
    },
  },
  statusBar: {
    status: 'অবস্থা',
    validation: 'যাচাই',
    validationOk: 'বৈধ',
    validationFailed: (n) => `${n}টি সমস্যা`,
    validationNone: 'ইমপোর্ট করা হয়নি',
    updates: 'হালনাগাদ',
    noUpdates: 'এখনো কোনো পরিবর্তন নেই।',
    events: {
      imported: (t) => `${t} ইমপোর্ট হয়েছে`,
      'import-failed': (t) => `ইমপোর্ট ব্যর্থ: ${t}`,
      reset: () => 'প্রাথমিক অবস্থায় রিসেট করা হয়েছে',
      'start-selected': (t) => `শুরুর অবস্থান ${t}`,
      'node-blocked': (t) => `${t} অবরুদ্ধ`,
      'node-unblocked': (t) => `${t} মুক্ত`,
      'edge-blocked': (t) => `করিডোর ${t} অবরুদ্ধ`,
      'edge-unblocked': (t) => `করিডোর ${t} মুক্ত`,
      'exit-closed': (t) => `বহির্গমন ${t} বন্ধ`,
      'exit-opened': (t) => `বহির্গমন ${t} আবার খোলা`,
    },
  },
}

export const translations: Record<Language, Translation> = { en, bn }
