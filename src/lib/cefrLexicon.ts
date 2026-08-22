import type { CefrLevel } from "@/lib/cefr";

/**
 * A local A1–C1 word list, used to level common vocabulary without asking the
 * model.
 *
 * WHY THIS EXISTS: not really to save tokens. Measured, the per-word `cefr`
 * field is about 1% of a lesson's output tokens — dropping it entirely would
 * barely show up on the bill. What it buys is CONSISTENCY: the model returns
 * B1 for "important" on one run and B2 on the next, and a level that moves
 * between runs is not a level. A lookup answers the same way every time.
 *
 * WHAT IT DELIBERATELY DOES NOT COVER: C2, and the long tail of specialised or
 * figurative vocabulary a transcript throws up ("flywheel"). Those are
 * open-ended, and a hand-written list would be guessing. The model still
 * answers for anything not listed here.
 *
 * SOURCING: written from ordinary knowledge of how common these words are. No
 * published word list is reproduced — the Oxford 3000/5000 in particular is
 * OUP's to license, and vendoring it into a paid app is not a thing to do
 * quietly. To swap in a licensed list later, keep `lookupCefr`'s signature and
 * replace the tables below.
 */

/**
 * When true the prompt still asks the model for a level, and the table below
 * simply overrides it wherever it has an answer.
 *
 * Flip to false once the table is big enough to stand alone: that drops the
 * `cefr` field from the prompt AND the schema, and any word the table doesn't
 * know then shows no level chip at all (the UI already handles that — see
 * CefrBadge). Do not flip it while the table is this small; most of a lesson
 * would lose its chips.
 */
export const ASK_MODEL_FOR_CEFR = true;

// Split by level and stored as plain strings: this is a word list, and a list
// of 400 object literals would be four times the size and no clearer.
const A1_WORDS = `
a about after all also and animal answer any ask baby back bad bag be beautiful
because bed before begin behind best better big bird birthday black blue boat
body book box boy bread break bring brother brown build bus busy but buy call
can car cat chair child city class clean clock close cold colour come computer
cook country cup cut dance day desk do doctor dog door down draw drink drive eat
egg eight end evening every eye face family fast father feel find fine finish
fire first fish five floor flower fly food foot for four free friend from front
fruit full fun game garden get girl give glass go good goodbye grandmother great
green group grow hair hand happy hard hat have he head hear heavy hello help
here high his history hold home hospital hot hour house how hungry husband ice
idea if important in interesting job jump keep key kind kitchen know lamp
language large last late learn leave left leg lesson letter light like listen
little live long look lose love lunch make man many map market meat meet milk
minute Monday money month morning mother mountain mouth move much music must
name near need never new news next nice night no nose not now number of off
office often old on one open or orange other out page paint paper park part
party pen pencil people phone picture pink place plant play please police poor
put question rain read ready red remember restaurant rice right river road room
run sad same say school sea season seat see sell send seven she shoe shop short
show sing sister sit six sleep slow small snow so some song sorry speak spell
sport spring stand star start station stay stop store street strong student
study sugar summer sun swim table take talk tall teacher team tell ten thank
that the then there they thing think three time tired to today together tomorrow
tonight town train travel tree try turn two under understand up use vegetable
very village visit wait walk wall want warm wash watch water we wear weather week
well what when where white who why wife win window winter woman word work world
write year yellow yes yesterday young
`;

const A2_WORDS = `
accept accident across activity add address adult advice afraid again age agree
air airport allow almost alone along already although always amazing among angry
another anyone anything appear area arm army around arrive art asleep attack
available average avoid away baby back bank bath beach bear beat become bed
believe belong below beside between beyond bicycle bill bit bite blood blow
board boil bone bored borrow both bottle bottom bowl brain branch brave bridge
bright brush build business camera camp cancel candle care careful carry cash
castle catch cause centre century certain chance change character charge cheap
check cheese chicken choice choose church cinema circle clear clever climb clothes
cloud club coast coat coffee coin collect college colour comfortable common
company compare competition complete computer concert condition contact continue
control conversation cook copy corner correct cost cotton count couple course
cover crazy cross crowd cry culture curtain customer cycle damage dark date dead
decide decision deep degree deliver dentist depend describe design detail develop
dictionary die difference difficult dinner direct dirty discover discuss disease
distance divide doctor dollar double doubt draw dream dress drop dry duck during
each early earn earth easy edge education effect either elephant else email
empty end enemy energy engine enjoy enough enter equal escape especially event
exactly example excellent except excited exercise exist expect expensive
experience explain express extra fact factory fail fair fall famous fantastic
far farm fashion fat favourite feed feeling fever field fight fill film final
finger fit fix flat flight floor fold follow foreign forest forget forgive form
free freeze fresh friendly frighten front future gate general gift glad glass
goal gold golf grade grass grey ground guess guest guide gun hall hang happen
hate health hear heart heat height hide history hit hobby hole holiday honest
hope horse hotel however huge hurry hurt ill imagine improve include increase
industry information injure insect inside instead interest international
internet interview introduce invent invite island jacket job join joke journey
judge juice jump just keep kick kill king kiss knife knock knowledge lady lake
land laugh law lay lazy lead leaf lend length less letter level library lie life
lift light line lion list local lock lonely lose loud low luck machine magazine
main manage mark marry match material matter maybe meal mean measure medicine
member memory mention message metal method middle might mind mirror miss mistake
mix modern moment monkey moon most mountain mouse move museum musician nature
nearly necessary neck need neighbour nervous newspaper noise none normal north
note nothing notice novel nurse ocean offer oil once online only opinion
opportunity opposite order ordinary organize original outside oven own pack pain
paint pair palace pardon parent pass passenger past patient pattern pay peace
perfect perform perhaps period permission person pet pick picnic piece pilot pity
plan plate pleasant pocket poem point poison polite pool popular position
possible post pour power practise prefer prepare present president press pretty
prevent price prince print prison prize probably problem produce program progress
project promise protect proud provide public pull purpose push quality quarter
queen quick quiet quite race radio railway raise rare reach real reason receive
recent recognize record reduce refuse regular relax remove rent repair repeat
reply report rest result return rich ring rise risk rock roof round rubbish rule
safe sail salt sand save scene score screen search secret section seem sense
separate serious serve several shake shape share sharp sheet shelf shine ship
shoot shopping shout shower shut sick side sign silver similar simple since
single size skill skin sky smell smile smoke smooth soft soil soldier solve son
soon sound soup south space special speed spend spirit spoil spoon spread square
stage stairs stamp step stick still stomach stone storm story straight strange
stranger stream stress strict string style subject succeed such sudden suffer
sugar suggest suit sun supermarket support suppose sure surface surprise sweet
swim system taste tax teach team tear technology teeth telephone television
temperature terrible test text theatre thick thin thick thought throw ticket tidy
tie tight tiny tip title tool tooth top total touch tour towards towel tower
traffic training transport trip trouble true trust truth type typical ugly
umbrella uncle unfortunately uniform unit universe university unless until usual
valley value various video view visitor voice volume wake war warn waste wave
weak wealth weight welcome wet wheel whether whole wide wild wind wing wise wish
wood wool worry worth wrong yard youth zone
`;

const B1_WORDS = `
ability abroad absolutely academic access according account achieve action
active actual admire admit advance advantage adventure advertise affect afford
agency agent aim alarm alive amount analyse ancient announce annoy anxious apart
apologize appearance apply appointment approach appropriate approve argue
argument arrange arrest article artificial ashamed aspect assist assume
atmosphere attach attempt attend attention attitude attract audience author
authority automatic available award aware balance ban barrier basic battle
behaviour belief benefit blame bless boring bother brand breath brief broadcast
budget campaign cancel candidate capable capacity capture career case category
ceiling celebrate ceremony challenge championship channel chapter charity chase
cheat chemical chief circumstance citizen civil claim classic client climate
clue coach code collapse colleague combine comfort command comment commercial
commit committee communicate community compete complain complex concentrate
concept concern conclude conclusion condition confidence confirm conflict
confuse connect conscious consider consist constant construct consult consume
contain contract contrast contribute convince cope core cost council courage
create creature crime crisis criticize crop crowd cure curious currency current
damage debate decade decline decrease defeat defend define definite degree delay
deliberate demand demonstrate deny department depend depress describe deserve
desire destroy detail detect determine device devote diet differ digital
disappear disappoint discipline discount display distance distant distinguish
disturb divide document domestic dominate donate download drag drama dramatic due
duty earn economy edition editor effect efficient effort elect element eliminate
emerge emotion employ empty encourage engage enormous ensure entertain
enthusiasm entire environment equipment error essential establish estimate
evidence exact examine exchange exclude excuse execute exhibition expand expert
explode explore export expose extend extreme facility factor fade failure fair
faith fame familiar fantasy fashion fault feature fee fetch fiction figure
finance firm flame flavour flexible float flood flow focus forecast formal
former fortune forward found frame frequent fuel function fund furniture gain
gap gather gender generate generation generous gentle genuine gesture glance
global glory goods gradual grain grant grateful greet guarantee guard habit
handle harm harvest headline heal heritage hesitate highlight hire honour host
household humour identify identity ignore illegal illustrate image immediate
impact impress incident income indeed independent indicate individual industrial
influence inform initial injury innocent inquiry insist inspire install
instance institute instruction instrument insurance intend intense interpret
invest investigate involve issue journal journalist justice justify keen label
labour lack landscape launch layer leadership leak lean legal leisure liberty
license limit link liquid literature loan logical loose luxury maintain major
majority manner manufacture margin mass master maximum meanwhile measure media
medical mental mercy mere method military minimum minister minor mission mixture
mobile mood moral motivate multiple murder mutual native negative neglect
negotiate nerve network neutral nonsense norm objective observe obtain obvious
occasion occupy occur odd offend official operate opponent oppose option
organic origin otherwise outcome output overall overcome owe pace panel panic
participate particular partner passion patience peak penalty pension percentage
permanent persuade phase phenomenon physical pile pitch plenty poet policy
politics pollution portion portrait pose possess potential poverty praise
precise predict pregnant preserve pressure priority prison privacy private
procedure process produce profession profit promote proof proper proportion
propose prospect protest publish punish purchase pure pursue qualify quantity
quote radical range rank rate rating reaction reasonable recall recipe
recommend recover recruit reduce refer reflect reform regard region register
regret regulate reject relate relative release relevant reliable relief
religion reluctant rely remark remind remote repair replace represent
reputation request require rescue research reserve resident resist resolve
resource respect respond responsible restore restrict retain retire reveal
review revise reward rhythm rival roll romantic rough route routine royal ruin
rural sample satisfy scale scan scare scene schedule scheme scope score screen
seek seize select senior sensible sensitive sentence sequence session settle
severe shade shallow shelter shift shock shortage sight signal significant
silence similar sincere site situation slice slight slip society software
solution somewhat sophisticated sort soul source spare species specific
spectacular spin spot stable staff stare status steady steep stimulate stock
strategy strengthen stretch strike structure struggle stuff stupid submit
substance subtle suburb sufficient suit summary supply surgery surround survey
survive suspect suspend sustain switch symbol sympathy talent target tape
target technique temporary tempt tend tension term terminal territory theory
therefore threat thrill throughout thus tone topic trace track trade tradition
transfer transform translate trap treat treatment tremendous trend trial tribe
trick trigger triumph tune twist ultimate unique unite universal urban urge
usual valid vanish variety vast venture version vessel victim victory violence
virtual virtue vision visual vital volunteer voyage wander warmth warrant
weapon welfare whereas wherever widespread willing wipe withdraw witness
workshop worship wrap yield zone
`;

const B2_WORDS = `
abandon accompany accomplish accumulate accurate accuse acknowledge acquire
adapt adequate adjust administration admission adopt affair aggressive
agriculture alter alternative ambition analysis anticipate anxiety apparent
appeal appreciate approach architecture arise array assemble assess asset
assign associate assumption attain attribute authentic authorize await barrier
bias bid blend boost boundary breakthrough brutal burden census certificate
cite civilian clarify classify collaborate collective commission commitment
compensate competent comprehensive compromise component confess confront
consequence considerable consistent contemporary controversy convention convert
cooperate coordinate correspond corrupt crucial decisive dedicate deliberate
delicate desperate despite diagnose discrimination dismiss dispute distinct
distribute diverse dynamic elegant emphasis enterprise entitle ethic evaluate
evident evolve exaggerate exceed exceptional exclusive execute exhaust exhibit
extract fragile framework fraud fulfil fundamental furthermore grant grave
grief grim guideline immense immune implement implication imply impose incentive
incorporate index inevitable infinite inherit initiate innovate insight inspect
instinct integrate intensify interfere interior intermediate intimate isolate
legislation likewise magnitude manipulate merge merit migrate milestone modify
momentum monitor mortgage nominate obligation ongoing outlook overlap overlook
parallel partial passive perceive persist perspective portray practical precede
presume prime principal proceed prohibit prominent prompt provision provoke
reassure rebel recession refine reinforce render replicate reproduce resemble
resolve retrieve revenue reverse revive rigid robust scarce scenario segment
seminar setback simulate simultaneous sole span spectrum stem straightforward
subsequent substitute succession summit superior supplement suppress surge
surplus sustain symbolic tackle tangible terminate threshold thrive tolerate
transaction transit transmit transparent trivial underlying undergo undermine
undertake uniform uphold utilize validate versatile viable vice vigorous
violate virtually vivid warrant widespread yield
`;

/**
 * C1 is included after all — the first draft filed these under B2 and a test
 * caught it labelling "empirically" as B2. Levelling a genuinely advanced word
 * one band too low is worse than having no label: the chip exists so a learner
 * can judge whether a word is above them.
 *
 * C2 is still left entirely to the model. It is a small, open-ended band where
 * a hand-written list would be guessing.
 */
const C1_WORDS = `
abstract absurd advocate aesthetic ambiguous amend arbitrary articulate aspire
assert assurance astonish autonomy bizarre breach bureaucracy capitalize
catastrophe cease coherent coincide commence commodity compassion compel compile
complement compliance comply comprise conceal concede conceive condemn confer
confine conform consecutive consensus conserve conspicuous constitute constrain
contemplate contempt contend contingency converge convey conviction correlate
counterpart credibility criteria crude cultivate cumulative curb deduce deem
defect deficiency deficit definitive denote depict deploy deprive derive
descend designate despair deteriorate deviate diminish discourse discreet
discrepancy discretion disclose disperse displace disposal disrupt dissolve
distort divert doctrine drastic dubious dwell elaborate elicit eloquent embark
embrace empirical enact endeavour endorse endure enhance entity equity erode
erupt escalate essence evoke exempt exert explicit exploit facilitate faction
feasible fluctuate formulate foster fraction hierarchy hostile hypothesis
ideology illuminate imitate inclination incur indefinite indigenous induce
indulge infer inherent inhibit integral integrity intellect intervene intricate
intrinsic invoke jeopardy judicial juncture legacy legitimate liable lucrative
mandate manifest marginal mediate mediocre metaphor mimic mobilize monopoly
morale nominal notion notwithstanding nourish nurture obscure offset optimal
orientation outset outweigh oversee paradigm paradox parameter patent peripheral
perpetual pertinent pervasive plausible plunge posture precedent predominant
preliminary premise premium prevail proclaim profound prolong proximity prudent
quota radiate rational realm reap reciprocal reconcile rectify redundant refrain
refute regime reiterate renounce reside residual resilient restrain rigorous
sanction saturate sceptical scrutiny seclude solely speculate sphere spontaneous
stagnant stark statute stipulate subordinate subsidy suffice superficial surpass
susceptible synthesis temperament tentative testify transcend traverse turmoil
unprecedented vicinity vindicate vocation void whereby
`;

function buildTable(): Map<string, CefrLevel> {
  const table = new Map<string, CefrLevel>();

  // Later levels must NOT overwrite earlier ones: a word that appears in both
  // A1 and A2 is an A1 word, and the earlier (easier) reading is the honest
  // one to show a learner.
  const levels: [CefrLevel, string][] = [
    ["A1", A1_WORDS],
    ["A2", A2_WORDS],
    ["B1", B1_WORDS],
    ["B2", B2_WORDS],
    ["C1", C1_WORDS],
  ];

  for (const [level, words] of levels) {
    for (const word of words.trim().split(/\s+/)) {
      const key = word.toLowerCase();
      if (key && !table.has(key)) {
        table.set(key, level);
      }
    }
  }

  return table;
}

const TABLE = buildTable();

/**
 * Inflected forms reduced to the base form the table stores.
 *
 * Deliberately crude — no stemmer, no dependency. Each candidate is checked
 * against the table, so an over-eager reduction ("running" → "runn") simply
 * misses rather than returning a wrong level.
 */
function baseForms(word: string): string[] {
  const forms = [word];
  const add = (form: string) => {
    if (form.length >= 2 && !forms.includes(form)) {
      forms.push(form);
    }
  };

  if (word.endsWith("ies")) {
    add(`${word.slice(0, -3)}y`);
  }
  if (word.endsWith("es")) {
    add(word.slice(0, -2));
  }
  if (word.endsWith("s")) {
    add(word.slice(0, -1));
  }
  if (word.endsWith("ied")) {
    add(`${word.slice(0, -3)}y`);
  }
  if (word.endsWith("ed")) {
    add(word.slice(0, -2));
    add(word.slice(0, -1)); // liked → like
  }
  if (word.endsWith("ing")) {
    const stem = word.slice(0, -3);
    add(stem);
    add(`${stem}e`); // making → make
    // running → run: a doubled final consonant before -ing.
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) {
      add(stem.slice(0, -1));
    }
  }
  if (word.endsWith("ily")) {
    add(`${word.slice(0, -3)}y`); // happily → happy
  }
  if (word.endsWith("ly")) {
    add(word.slice(0, -2)); // quickly → quick
    add(`${word.slice(0, -1)}e`); // simply → simple
  }
  if (word.endsWith("er") || word.endsWith("est")) {
    add(word.slice(0, word.endsWith("er") ? -2 : -3));
  }

  return forms;
}

/**
 * The level for a word, or undefined when this table has no opinion.
 *
 * MULTI-WORD ENTRIES ARE NEVER GUESSED FROM THEIR PARTS. "keep up with" is not
 * "keep": the phrase is B1 while the verb is A1, and levelling a phrasal verb
 * by its first word would confidently mislabel exactly the items a lesson is
 * built around. A phrase is looked up whole or not at all.
 */
export function lookupCefr(word: unknown): CefrLevel | undefined {
  if (typeof word !== "string") {
    return undefined;
  }

  const cleaned = word
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return undefined;
  }

  if (cleaned.includes(" ")) {
    return TABLE.get(cleaned);
  }

  for (const form of baseForms(cleaned)) {
    const level = TABLE.get(form);
    if (level) {
      return level;
    }
  }

  return undefined;
}

/** Entry count, for the measurement script and the admin debug view. */
export const CEFR_LEXICON_SIZE = TABLE.size;
