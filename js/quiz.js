/**
 * CyberShield - quiz.js
 * Contains question databases, evaluation logic, and active screen handlers
 * for the Entry Test (Diagnostic), Module Quizzes, Interactive Office Audit,
 * and the Escape Room.
 */

window.QuizData = {
    // 1. Diagnostic/Entry Test
    diagnostic: [
        {
            id: "diag-q1",
            question: "Mi az információbiztonság három legfőbb alappillére (a CIA-triád)?",
            answers: [
                { text: "Célratörtség, Integráció, Alaposság", correct: false },
                { text: "Bizalmasság, Sértetlenség, Rendelkezésre állás", correct: true },
                { text: "Csoportmunka, Információ-áramlás, Adatvédelem", correct: false },
                { text: "Titkosítás, Hitelesítés, Naplózás", correct: false }
            ],
            explanation: "Az információbiztonság klasszikus elmélete a CIA-triádon nyugszik: Confidentiality (Bizalmasság), Integrity (Sértetlenség) és Availability (Rendelkezésre állás)."
        },
        {
            id: "diag-q2",
            question: "Hogyan ismerhető fel a legkönnyebben egy tipikus adathalász (phishing) e-mail?",
            answers: [
                { text: "Sürgető hangvétellel fenyeget, helyesírási hibákat tartalmaz, és gyanús hivatkozásra kattintást kér", correct: true },
                { text: "Mindig nagy méretű PDF fájl van mellékelve hozzá", correct: false },
                { text: "Kizárólag angol nyelven érkezhet meg", correct: false },
                { text: "A feladó címe pontosan megegyezik a bankom hivatalos címével", correct: false }
            ],
            explanation: "Az adathalász levelek gyakran sürgetik a felhasználót (pl. 'fiókját zároljuk'), nyelvtani hibásak és gyanús URL-ekre mutatnak."
        },
        {
            id: "diag-q3",
            question: "Mit tesz Ön, ha egy ismeretlen márkájú USB pendrive-ot talál a kapitányság folyosóján?",
            answers: [
                { text: "Bedugom egy nem használt gépbe, hogy kiderítsem, kié lehet", correct: false },
                { text: "Hazaviszem és a saját otthoni gépemen formázom meg", correct: false },
                { text: "Érintetlenül hagyom és azonnal értesítem az informatikai biztonsági tisztet (IBT)", correct: true },
                { text: "Kidobom a legközelebbi papírkosárba", correct: false }
            ],
            explanation: "Az elhagyott pendrive-ok (BadUSB támadás) veszélyes kártékony kódokat futtathatnak azonnal a bedugás pillanatában. Sose dugja be őket!"
        },
        {
            id: "diag-q4",
            question: "Melyik tekinthető a legerősebb jelszónak az alábbiak közül?",
            answers: [
                { text: "Admin2026!", correct: false },
                { text: "KovacsJános123", correct: false },
                { text: "szep_zold_erdoben_sétaltam_19!#", correct: true },
                { text: "QWERTZ123456", correct: false }
            ],
            explanation: "A jelszó hosszúsága a legmeghatározóbb tényező. Egy hosszú, kis- és nagybetűket, írásjeleket tartalmazó jelmondat szinte feltörhetetlen."
        },
        {
            id: "diag-q5",
            question: "Mi a kétlépcsős azonosítás (2FA / MFA) valódi célja?",
            answers: [
                { text: "Hogy kétszer kelljen beírni ugyanazt a jelszót a biztonság kedvéért", correct: false },
                { text: "Hogy a jelszó megszerzése után is egy második, dinamikus tényező (pl. SMS vagy hitelesítő app kód) védje a fiókot", correct: true },
                { text: "Hogy a rendszer kétszer gyorsabban töltse be az adatokat", correct: false },
                { text: "Ez csak az oktatók számára szükséges adminisztratív eszköz", correct: false }
            ],
            explanation: "A kétlépcsős azonosítás megakadályozza a belépést akkor is, ha a támadó valahogy megszerezte az Ön statikus jelszavát."
        },
        {
            id: "diag-q6",
            question: "Szabad-e a szolgálati számítógép kávéalátétjére vagy monitorára felragasztani a belépési jelszót?",
            answers: [
                { text: "Igen, ha a betűk kicsik és nem feltűnőek", correct: false },
                { text: "Szigorúan tilos, mert a fizikai betekintés (váll feletti leskelődés) azonnali visszaélést tesz lehetővé", correct: true },
                { text: "Igen, amennyiben a szobában csak megbízható kollégák tartózkodnak", correct: false },
                { text: "Csak akkor, ha az IBT ezt engedélyezi", correct: false }
            ],
            explanation: "A jelszavak felírása és szem előtt hagyása nullára csökkenti a digitális védelmi rendszerek hatékonyságát."
        },
        {
            id: "diag-q7",
            question: "Mit kell tennie Önnek, ha akár csak 2 percre is elhagyja az irodai asztalát?",
            answers: [
                { text: "Nem kell tennem semmit, az ajtó úgyis be van csukva", correct: false },
                { text: "Le kell takarnom a monitort egy papírlappal", correct: false },
                { text: "Le kell zárnom a Windows-t a 'Win + L' billentyűkombinációval vagy a kártyám kihúzásával", correct: true },
                { text: "Meg kell kérnem a szomszéd kollégát, hogy nézzen rá néha", correct: false }
            ],
            explanation: "A magára hagyott, bejelentkezett terminál a legkönnyebb célpont a belső támadók vagy jogosulatlan látogatók számára."
        },
        {
            id: "diag-q8",
            question: "Milyen Wi-Fi hálózatra szabad csatlakoztatni a szolgálati mobileszközt?",
            answers: [
                { text: "Bármilyen jelszó nélküli nyilvános wifire a gyors ügyintézés érdekében", correct: false },
                { text: "Kizárólag a rendőrség hivatalos, védett, zárt és auditált hálózataira (vagy jóváhagyott titkosított VPN csatornán keresztül)", correct: true },
                { text: "A közeli kávézó hálózatára, ha ismerem a jelszót", correct: false },
                { text: "Bármelyik otthoni wifire korlátozások nélkül", correct: false }
            ],
            explanation: "A nyitott vagy idegen Wi-Fi hálózatokon keresztüli adatforgalom könnyen lehallgatható (Man-in-the-Middle támadás)."
        },
        {
            id: "diag-q9",
            question: "Mi a zsarolóprogramok (ransomware) legfőbb fenyegetése?",
            answers: [
                { text: "Lassítják a processzor működését és reklámokat jelenítenek meg", correct: false },
                { text: "Titkosítják a szervezet fájljait és merevlemezeit, majd váltságdíjat követelnek a feloldó kulcsért", correct: true },
                { text: "Törlik a böngészési előzményeket", correct: false },
                { text: "Kiküldik a gép adatait a közösségi médiába", correct: false }
            ],
            explanation: "A ransomware leállíthatja a teljes rendőrségi infrastruktúrát az adatok titkosításával. Védekezés: offline mentések és óvatosság."
        },
        {
            id: "diag-q10",
            question: "Mit értünk social engineering (pszichológiai manipuláció) alatt?",
            answers: [
                { text: "A rendőrségi rádiócsatornák kódolási eljárását", correct: false },
                { text: "Olyan módszert, amely az emberi jóhiszeműséget, félelmet vagy kíváncsiságot kihasználva csal ki bizalmas információkat", correct: true },
                { text: "A közösségi média oldalak elemzését nyomozati célból", correct: false },
                { text: "A hálózati routerek szoftveres frissítését", correct: false }
            ],
            explanation: "A social engineering az emberi tényezőt támadja (pl. telefonos csaló, aki rendszergazdának adja ki magát)."
        },
        {
            id: "diag-q11",
            question: "Szabad-e saját privát Gmail vagy Freemail fiókot használni szolgálati iratok továbbítására?",
            answers: [
                { text: "Igen, ha a hivatali levelező éppen lassú vagy nem működik", correct: false },
                { text: "Nem, ez súlyos szabályszegés, mivel a külső levelezők nem nyújtanak garantált állami adatvédelmet", correct: true },
                { text: "Csak akkor, ha a címzett is rendőrségi dolgozó", correct: false },
                { text: "Igen, ha jelszóval védett tömörített fájlban küldöm el", correct: false }
            ],
            explanation: "Hivatalos és titkosított rendőrségi adatokat szigorúan tilos ellenőrizetlen lakossági felhőszolgáltatásokon keresztül mozgatni."
        },
        {
            id: "diag-q12",
            question: "Ki tartózkodhat felügyelet nélkül a kapitányság védett szerverhelyiségében?",
            answers: [
                { text: "Bármelyik rendőrjárőr, akinek van belépőkártyája az épületbe", correct: false },
                { text: "A takarító személyzet munkaidőben", correct: false },
                { text: "Kizárólag az arra kifejezetten feljogosított hálózati rendszergazdák és kijelölt biztonsági tisztek", correct: true },
                { text: "Bárki, akit a kapus beenged", correct: false }
            ],
            explanation: "A fizikai behatolás a szerverhelyiségbe azonnali teljes kompromittálódást jelenthet, ezért a belépés szigorúan korlátozott és naplózott."
        },
        {
            id: "diag-q13",
            question: "Mi az első és legfontosabb teendő, ha gyanítja, hogy szolgálati számítógépe zsarolóprogrammal fertőződött meg?",
            answers: [
                { text: "Azonnal leválasztom a gépet a hálózatról (kihúzom a LAN kábelt, lekapcsolom a Wi-Fi-t), és értesítem az incidensfelelőst", correct: true },
                { text: "Kikapcsolom és bekapcsolom a gépet többször egymás után", correct: false },
                { text: "Megpróbálom letölteni egy ingyenes vírusirtót az internetről", correct: false },
                { text: "Nem teszek semmit, megvárom a műszak végét", correct: false }
            ],
            explanation: "A hálózatról való azonnali fizikai lecsatlakoztatás megakadályozza, hogy a vírus átterjedjen a kapitányság többi gépére."
        },
        {
            id: "diag-q14",
            question: "Melyik állítás írja le helyesen a biztonsági mentések kezelését?",
            answers: [
                { text: "Elegendő félévente egyszer lemásolni a fájlokat egy asztali pendrive-ra", correct: false },
                { text: "A biztonsági mentéseket rendszeresen, elkülönített (offline) tárhelyen kell tárolni, és tesztelni kell a visszaállíthatóságukat", correct: true },
                { text: "Ha felhőben tároljuk az adatokat, nincs szükség mentésekre", correct: false },
                { text: "A mentés kizárólag az oktatók feladata", correct: false }
            ],
            explanation: "A hálózattól elszigetelt (offline/air-gapped) mentés az egyetlen biztos védelem a rendszereket letaroló zsarolóprogramok ellen."
        },
        {
            id: "diag-q15",
            question: "Mit mond ki a legkisebb jogosultság elve (Principle of Least Privilege)?",
            answers: [
                { text: "Hogy az újoncoknak semmilyen rendszerhez nem szabad hozzáférést adni", correct: false },
                { text: "Hogy minden munkatárs csak a feladatai elvégzéséhez feltétlenül szükséges minimális adatokhoz és rendszerekhez kapjon hozzáférést", correct: true },
                { text: "Hogy a legkisebb rendfokozatú kollégának van a legkevesebb joga panaszkodni", correct: false },
                { text: "Hogy a jelszavak hossza maximum 8 karakter lehet", correct: false }
            ],
            explanation: "A legkisebb jogosultság elve csökkenti a kockázatot: ha egy felhasználói fiók kompromittálódik, a támadó csak korlátozott adatokhoz férhet hozzá."
        }
    ],

    // 2. Interactive Office Errors Database
    officeErrors: {
        "open-window": {
            title: "Nyitott ablak és betekintési rés",
            desc: "A földszinti vagy könnyen megközelíthető nyitott ablak fizikai behatolás forrása lehet, ráadásul illetéktelenek kívülről ráláthatnak a monitorokra (vizuális adathalászat / shoulder surfing)."
        },
        "board-pass": {
            title: "Jelszavak a közös faliújságon",
            desc: "A faliújságra ragasztott belépési kódok és jelszavak durván megsértik a titoktartást. Bárki, aki belép az irodába (pl. ügyfelek, karbantartók), azonnal rögzítheti őket."
        },
        "sensitive-board": {
            title: "Bizalmas nyomozási adatok a táblán",
            desc: "A folyamatban lévő ügyek gyanúsítottjainak személyes adatai vagy hivatali kódok felírása a jól látható fehér táblára vizuális adatszivárgást okoz. Használat után a táblát azonnal le kell törölni!"
        },
        "open-drawer": {
            title: "Lezáratlan iratszekrény szenzitív aktákkal",
            desc: "A szigorúan titkos minősítésű nyomozati aktákat használaton kívül mindig zárt fémszekrényben kell tartani. A nyitott fiókból bárki könnyen kivehet vagy lefotózhat fontos dokumentumokat."
        },
        "unlocked-pc1": {
            title: "Magára hagyott, feloldott számítógép",
            desc: "Az aktív MS Teams vagy levelező felügyelet nélkül hagyása lehetőséget ad arra, hogy valaki a nevünkben üzeneteket küldjön, adatokat töltsön le, vagy kártékony programot telepítsen."
        },
        "monitor-pass": {
            title: "Monitorra ragasztott jelszó post-it",
            desc: "A klasszikus és legsúlyosabb biztonsági mulasztások egyike. A monitor kávájára ragasztott sárga papír teljesen értelmetlenné teszi a jelszavas védelem létezését."
        },
        "unattended-phone": {
            title: "Felügyelet nélküli szolgálati okostelefon",
            desc: "Az asztalon hagyott telefon könnyen ellopható, vagy ha nincs lezárva, a támadó azonnal hozzáfér a rendőrségi hálózati csevegésekhez, névjegyzékhez és belső alkalmazásokhoz."
        },
        "abandoned-usb": {
            title: "Ottfelejtett ismeretlen USB meghajtó",
            desc: "A billentyűzet mellett hagyott pendrive fertőzött lehet (BadUSB), vagy ha szolgálati adatokat tartalmaz, az hanyag kezelésnek minősül és adatvesztéshez vezethet."
        },
        "desk-document": {
            title: "Szigorúan titkos irat az üres asztalon",
            desc: "A 'tiszta asztal' (Clean Desk) irányelv megsértése. Amikor felállunk az asztaltól, minden papíralapú bizalmas dokumentumot el kell zárni a fiókba vagy széfbe."
        },
        "coffee-hazard": {
            title: "Folyadék az elektromos elosztó mellett",
            desc: "A szolgálati eszközök mellett hagyott nyitott kávésbögre nemcsak zárlatot és tüzet okozhat, hanem az értékes informatikai berendezések fizikai tönkretételét és adatvesztést is idézhet elő."
        },
        "exposed-router": {
            title: "Védtelen hálózati elosztó / router port",
            desc: "Az asztal alatt lévő hálózati eszközök nincsenek elzárva. Egy fizikai behatoló közvetlenül rácsatlakozhat a rendőrségi belső LAN hálózatra egy saját eszközzel."
        },
        "printer-document": {
            title: "Nyomtatón felejtett bizalmas dokumentumok",
            desc: "A nyomtatási feladat elküldése után az iratokat azonnal el kell hozni a tálcáról. A nyomtatón hagyott lapokat bárki átlapozhatja, lemásolhatja vagy véletlenül elviheti."
        },
        "cctv-angle": {
            title: "Rosszul pozicionált biztonsági kamera",
            desc: "A kamera látószöge közvetlenül rálát az egyik monitor képernyőjére és a billentyűzetre, így a felvételeken rögzítésre kerülhetnek a beütött jelszavak és titkos adatok."
        },
        "unshredded-bin": {
            title: "Megsemmisítetlen bizalmas akta a normál kukában",
            desc: "Szenzitív papírokat szigorúan tilos az egyszerű papírkosárba dobni. Minden ilyen dokumentumot iratmegsemmisítővel (shredder) kell olvashatatlanná tenni, különben 'kukázhatóak'."
        },
        "unattended-visitor": {
            title: "Kíséret nélküli idegen látogató",
            desc: "A piros ruhás látogató nem visel azonosító kártyát, és senki sem kíséri őt. A kapitányság belső irodáiban külső személy kizárólag állandó kísérettel tartózkodhat."
        }
    },

    // 3. Escape Room Riddles Database (8 levels)
    escaperoom: [
        {
            title: "Zár 1: A Gyanús Levél",
            riddle: "Kollégája kapott egy e-mailt a 'rendorseg-tamogatas@outlook.com' címről, mely szerint azonnal frissítenie kell a belépési kártyája adatait egy linken, különben felfüggesztik a szolgálatát. Mit javasol neki?",
            answers: [
                { text: "Kattintson a linkre gyorsan, mert fontos a szolgálat folytonossága.", correct: false },
                { text: "Ez egy egyértelmű adathalász kísérlet (phishing). Ne kattintson, küldje el az IBT-nek ellenőrzésre, majd törölje.", correct: true },
                { text: "Próbáljon meg válaszolni a levélre, és kérdezze meg, hogy tényleg ők küldték-e.", correct: false },
                { text: "Töltse le a levélben lévő mellékletet, fusson le rajta egy vírusirtó, ha tiszta, nyissa meg.", correct: false }
            ],
            explanation: "Hivatalos szervek soha nem használnak lakossági ingyenes levelezőket (outlook.com, gmail.com) és nem kérnek jelszavakat vagy kártyaadatokat linken keresztül."
        },
        {
            title: "Zár 2: A Véletlen Pendrive",
            riddle: "Az udvaron a járőrkocsi kereke mellett talál egy USB meghajtót, amire alkoholos filccel az van írva: 'BRFK Költségvetés 2026_Titkos'. Mi a helyes eljárás?",
            answers: [
                { text: "Azonnal adja le az Informatikai Biztonsági Tisztnek (IBT), tilos bármilyen hálózati gépbe bedugni.", correct: true },
                { text: "Dugja be egy elszigetelt, internet nélküli szolgálati gépbe, hátha valóban fontos rendőrségi adatok vannak rajta.", correct: false },
                { text: "Tartsa meg saját használatra, de előtte formázza le otthon.", correct: false },
                { text: "Hagyja ott, ahol van, hátha a tulajdonosa visszajön érte.", correct: false }
            ],
            explanation: "Ez egy klasszikus 'szándékos elhagyásos' szociális manipuláció (USB drop attack). A pendrive mikrovezérlője billentyűzetnek adhatja ki magát és másodpercek alatt megfertőzheti a hálózatot."
        },
        {
            title: "Zár 3: A Biztonságos Jelszó",
            riddle: "Új jelszót kell beállítania a Robotzsaru rendszerbe. Melyik felel meg a legmagasabb biztonsági követelményeknek, miközben könnyen megjegyezhető?",
            answers: [
                { text: "Rendor2026 (Egyszerű, van benne nagybetű és szám)", correct: false },
                { text: "kék_auto_Sziréna_villog_99!* (Hosszú jelmondat írásjelekkel és számokkal)", correct: true },
                { text: "P@ssw0rd123! (Megfelel a bonyolultsági szabálynak, de szótári támadással könnyen feltörhető)", correct: false },
                { text: "A saját születési dátumom visszafelé leírva", correct: false }
            ],
            explanation: "A jelszó hossza és egyedisége nyújtja a legnagyobb védelmet a brute-force és szótáralapú feltörési kísérletek ellen."
        },
        {
            title: "Zár 4: Közösségi Média Csapda",
            riddle: "Egy kedves ismeretlen jelöli be Önt a Facebookon, aki profilja szerint szintén rendőr egy másik megyében. Pár nap barátságos csevegés után megkérdezi, hogy 'nálatok is az új verziójú daktiloszkópiai szoftver fut-e, mert náluk sokat fagy'. Mit tesz?",
            answers: [
                { text: "Válaszolok neki barátságosan, hiszen kolléga, és elküldöm a belső verziószámot.", correct: false },
                { text: "Megkérdezem tőle, hogy ki a kapitányságvezetője, ha tudja, akkor válaszolok.", correct: false },
                { text: "Gyanakvóvá válok. Nem adok ki semmilyen belső informatikai részletet, és jelentem a gyanús érdeklődést az IBT-nek.", correct: true },
                { text: "Meghívom egy kávéra a kapitányság melletti büfébe, hogy személyesen beszéljük meg.", correct: false }
            ],
            explanation: "Ez egy klasszikus felderítő jellegű szociális manipuláció (Social Engineering). A támadók gyakran építenek fel hamis profilokat, hogy belső rendszerek részleteit derítsék ki."
        },
        {
            title: "Zár 5: A Telefonos Csaló",
            riddle: "Megcsörren a szolgálati telefonja. Egy férfi hang mutatkozik be: 'Szia, Kiss százados vagyok a központi IT-ról. Éppen adatbázis-karbantartást végzünk, szükségem lenne a belépési kódodra, hogy ellenőrizzem a jogosultságodat a Robotzsaruban.' Mi a válaszod?",
            answers: [
                { text: "Bediktálom neki, hiszen siet a munkájával és tiszttárs.", correct: false },
                { text: "Nem adom meg. Az IT osztály soha nem kér jelszót telefonon. Megkérdezem a pontos nevét, mellékét, leteszem, és hivatalos csatornán ellenőrzöm az azonosságát.", correct: true },
                { text: "Megkérem, hogy inkább e-mailben küldje el a kérést, és oda írom le a jelszavam.", correct: false },
                { text: "Leteszem a telefont és nem foglalkozom vele többet.", correct: false }
            ],
            explanation: "A 'vishing' (hangalapú adathalászat) során a támadó tekintélyelvűséggel vagy sürgetéssel próbál bizalmas adathoz jutni. Jelszót soha, senkinek nem adunk ki."
        },
        {
            title: "Zár 6: Veszélyes Wi-Fi",
            riddle: "Külső helyszíni nyomozás során sürgősen el kell küldenie egy jelentést a szolgálati laptopjáról, de nincs mobilnet térerő. Talál egy nyitott, jelszó nélküli Wi-Fi hálózatot 'Free_City_WiFi' néven. Mit tesz?",
            answers: [
                { text: "Csatlakozom és azonnal elküldöm a titkosított adatokat, a lényeg, hogy kész legyen a feladat.", correct: false },
                { text: "Nem csatlakozom. Nyitott hálózaton a támadók lehallgathatják az adatforgalmat. Megvárom, amíg biztonságos, jóváhagyott rendőrségi hálózatra vagy VPN csatornára tudok lépni.", correct: true },
                { text: "Csatlakozom, de csak a személyes Facebookomra lépek be, a rendőrségi rendszerekbe nem.", correct: false },
                { text: "Megkérdezem a közelben lévő járókelőket, hogy biztonságos-e a hálózat.", correct: false }
            ],
            explanation: "A nyilvános Wi-Fi hálózatok rendkívül veszélyesek. Egy támadó könnyen létrehozhat egy azonos nevű hamis hozzáférési pontot (Evil Twin támadás), hogy ellopja a hitelesítési adatokat."
        },
        {
            title: "Zár 7: Tiszta Asztal Elv",
            riddle: "A parancsnok hívatja Önt az irodájába egy sürgős megbeszélésre. Az asztalán éppen kiterítve fekszik egy folyamatban lévő büntetőügy nyomozati anyaga. Mit tesz, mielőtt feláll?",
            answers: [
                { text: "Úgy hagyom, hiszen csak a parancsnoki irodáig megyek, és a kollégák is bent vannak.", correct: false },
                { text: "Ráteszek egy üres lapot a tetejére, hogy ne látszódjon azonnal a szöveg.", correct: false },
                { text: "Minden szenzitív papírt elzárok a fiókomba/széfembe, lezárom a számítógépemet (Win+L), és csak ezután hagyom el az asztalt.", correct: true },
                { text: "Megkérem a szomszéd kollégát, hogy üljön át az én székemre, amíg vissza nem jövök.", correct: false }
            ],
            explanation: "A 'Clean Desk' (Tiszta asztal) és 'Clean Screen' (Tiszta képernyő) elvek betartása alapvető. Egy magára hagyott bizalmas irat vagy feloldott képernyő azonnali biztonsági incidens."
        },
        {
            title: "Zár 8: Vírusfertőzés Hárítása",
            riddle: "Észreveszi, hogy a számítógépe képernyőjén hirtelen egy piros visszaszámláló jelenik meg, és a fájljai kiterjesztése '.locked'-re változik. Egy felugró ablak váltságdíjat követel Bitcoinban. Mi a legelső teendője?",
            answers: [
                { text: "Megpróbálom gyorsan kifizetni a váltságdíjat a saját pénzemből, hogy ne legyen baj.", correct: false },
                { text: "Azonnal fizikai úton leválasztom a gépet a hálózatról (kihúzom a hálózati kábelt/LAN, lekapcsolom a Wi-Fi-t), és haladéktalanul jelentem az IBT-nek.", correct: true },
                { text: "Újraindítom a gépet többször hátha eltűnik a hiba.", correct: false },
                { text: "Gyorsan átmásolom a megmaradt fájlokat egy szolgálati pendrive-ra, hogy megmentsem őket.", correct: false }
            ],
            explanation: "Ransomware (zsarolóprogram) esetén a hálózatról való lecsatlakoztatás az egyetlen módja annak, hogy megakadályozzuk a vírus elterjedését a rendőrség többi gépére. A pendrive bedugása csak továbbterjesztené a fertőzést."
        }
    ],

    // 4. Module Content and Quizzes Database (5 Modules)
    modules: {
        1: {
            category: "1. PORTA",
            title: "Az Információbiztonság Alapjai",
            xpAward: 100,
            content: `
                <div class="space-y-6 text-slate-300">
                    <div class="bg-slate-950/50 p-4 border border-cyan-500/20 rounded-xl flex items-center space-x-3">
                        <span class="text-3xl">🛡️</span>
                        <div>
                            <h4 class="text-sm font-bold text-white uppercase tracking-wider">A Tananyag Célja</h4>
                            <p class="text-xs text-slate-400">Megismerni a rendőrségi zárt informatikai hálózatok védelmének alapjait és a CIA-triádot.</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">1. Mi az a CIA Triád?</h4>
                        <p class="text-xs leading-relaxed">
                            Minden információbiztonsági rendszer és szabályzat alapja három alapvető tulajdonság biztosítása:
                        </p>
                        <ul class="list-disc pl-5 text-xs space-y-2">
                            <li><strong class="text-cyan-400">Bizalmasság (Confidentiality):</strong> Az adatokhoz csak azok férhetnek hozzá, akik erre jogosultak. (Pl. egy nyomozati anyagot nem láthat illetéktelen személy).</li>
                            <li><strong class="text-cyan-400">Sértetlenség (Integrity):</strong> Az adatok nem módosulhatnak jogosulatlanul vagy észrevétlenül. Az információk pontossága és hitelessége garantált.</li>
                            <li><strong class="text-cyan-400">Rendelkezésre állás (Availability):</strong> Az arra jogosultaknak hozzá kell férniük a rendszerekhez és adatokhoz, amikor szükségük van rájuk a munkavégzéshez.</li>
                        </ul>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">2. Fizikai Biztonság a Kapitányságon</h4>
                        <p class="text-xs leading-relaxed">
                            A digitális védelem mit sem ér fizikai védelem nélkül. A kapuügyelet (Porta) az első védelmi vonal. 
                            Minden belépő külső személyt regisztrálni kell, belépőkártyával kell ellátni, és a belső irodákban folyamatos kíséretet kell biztosítani számukra. 
                            <strong>Soha ne hagyjon kíséret nélkül külső személyt a kapitányság védett övezetében!</strong>
                        </p>
                    </div>

                    <div class="space-y-3 bg-cyan-950/20 p-4 border border-cyan-900/30 rounded-xl">
                        <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Arany Szabályok</h4>
                        <ul class="list-decimal pl-5 text-[11px] space-y-1 text-slate-300 font-mono">
                            <li>Ismerje és alkalmazza a CIA-triád elveit minden napi szolgálati feladat során!</li>
                            <li>Mindig ellenőrizze a belépő személyek jogosultságát és jelvényét!</li>
                            <li>A gyanús fizikai behatolásokat vagy idegeneket azonnal jelentse az ügyeletnek!</li>
                        </ul>
                    </div>
                </div>
            `,
            quiz: [
                {
                    question: "Melyik NEM része a klasszikus CIA-triádnak?",
                    answers: [
                        { text: "Bizalmasság (Confidentiality)", correct: false },
                        { text: "Sértetlenség (Integrity)", correct: false },
                        { text: "Kommunikáció (Communication)", correct: true },
                        { text: "Rendelkezésre állás (Availability)", correct: false }
                    ]
                },
                {
                    question: "Mit kell tenni egy külső ügyféllel a kapitányság belső irodáiban?",
                    answers: [
                        { text: "Magára lehet hagyni, hiszen már belépett a portán.", correct: false },
                        { text: "Folyamatos kíséretet kell biztosítani számára a bent tartózkodása alatt.", correct: true },
                        { text: "Csak akkor kell kísérni, ha ő kéri.", correct: false },
                        { text: "Meg kell kérni, hogy ne nézzen a monitorokra.", correct: false }
                    ]
                }
            ]
        },
        2: {
            category: "2. IRODA",
            title: "Adathalászat Elleni Védelem",
            xpAward: 120,
            content: `
                <div class="space-y-6 text-slate-300">
                    <div class="bg-slate-950/50 p-4 border border-cyan-500/20 rounded-xl flex items-center space-x-3">
                        <span class="text-3xl">📧</span>
                        <div>
                            <h4 class="text-sm font-bold text-white uppercase tracking-wider">A Tananyag Célja</h4>
                            <p class="text-xs text-slate-400">Az adathalászat (phishing, spearfishing, vishing) különféle típusainak felismerése és kivédése.</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">1. Mi az az Adathalászat (Phishing)?</h4>
                        <p class="text-xs leading-relaxed">
                            Olyan csalási technika, amely során a támadó valamilyen megbízható szervezetnek (pl. bank, rendőrségi felsővezetés, IT osztály) adja ki magát, hogy érzékeny adatokat (felhasználónevek, jelszavak, bankkártyaszámok) szerezzen meg, vagy kártékony szoftvert telepítsen.
                        </p>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">2. Az Adathalászat Főbb Típusai</h4>
                        <ul class="list-disc pl-5 text-xs space-y-2">
                            <li><strong class="text-cyan-400">Tömeges Phishing:</strong> Sablonos levelek százezreknek küldve (pl. csomagküldő nevében).</li>
                            <li><strong class="text-cyan-400">Spear Phishing (Célzott adathalászat):</strong> Konkrét személyre szabott támadás. A támadó ismeri a célpont nevét, beosztását, és rendkívül hitelesnek tűnő történettel keresi meg.</li>
                            <li><strong class="text-cyan-400">Vishing (Telefonos adathalászat):</strong> Telefonon keresztül elkövetett csalás, ahol gyakran IT-s kollégának vagy banki biztonsági embernek kiadva magukat kérnek belépési adatokat.</li>
                        </ul>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">3. Hogyan ismerjük fel a gyanús levelet?</h4>
                        <p class="text-xs leading-relaxed">
                            Vizsgálja meg a feladó e-mail címét (pl. @police.hu helyett @police-support.com). 
                            Keresse a sürgető, fenyegető hangvételt. 
                            Sose kattintson a linkekre, vigye föléjük az egeret a valódi cím megtekintéséhez. 
                            Ne nyissa meg a gyanús mellékleteket (főleg az .exe, .scr, .zip, .docm kiterjesztéseket).
                        </p>
                    </div>

                    <div class="space-y-3 bg-cyan-950/20 p-4 border border-cyan-900/30 rounded-xl">
                        <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Arany Szabályok</h4>
                        <ul class="list-decimal pl-5 text-[11px] space-y-1 text-slate-300 font-mono">
                            <li>A rendőrség IT osztálya SOHA nem kér jelszót e-mailben vagy telefonon!</li>
                            <li>Mindig ellenőrizze a feladó valódi címét a levelezőprogramban!</li>
                            <li>Gyanús e-mail esetén azonnal értesítse az IBT-t, és ne kattintson semmire!</li>
                        </ul>
                    </div>
                </div>
            `,
            quiz: [
                {
                    question: "Mit javasolt tenni, ha egy e-mailben sürgős rendszerkarbantartásra hivatkozva kérik a Robotzsaru jelszavát?",
                    answers: [
                        { text: "Küldjük el, különben nem tudunk dolgozni később.", correct: false },
                        { text: "Válaszoljunk megadva a jelszót, de kérjük meg őket, hogy kezeljék bizalmasan.", correct: false },
                        { text: "Azonnal töröljük ki és jelentsük az esetet az IBT-nek, mert az IT sosem kér jelszót.", correct: true },
                        { text: "Hívjuk fel a bankunkat.", correct: false }
                    ]
                },
                {
                    question: "Mi jellemzi a Spear Phishinget (célzott adathalászatot)?",
                    answers: [
                        { text: "Kizárólag sms-ben terjed.", correct: false },
                        { text: "Személyre szabott, ismeri a nevünket és pozíciónkat, ezért sokkal hitelesebbnek tűnik.", correct: true },
                        { text: "Mindig tartalmaz helyesírási hibákat.", correct: false },
                        { text: "Kizárólag külföldi IP címről érkezhet.", correct: false }
                    ]
                }
            ]
        },
        3: {
            category: "3. NYOMOZÁS",
            title: "Mobilbiztonság & Eszközvédelem",
            xpAward: 130,
            content: `
                <div class="space-y-6 text-slate-300">
                    <div class="bg-slate-950/50 p-4 border border-cyan-500/20 rounded-xl flex items-center space-x-3">
                        <span class="text-3xl">📱</span>
                        <div>
                            <h4 class="text-sm font-bold text-white uppercase tracking-wider">A Tananyag Célja</h4>
                            <p class="text-xs text-slate-400">Megérteni a mobileszközök (telefonok, tabletek) és hordozható adathordozók (pendrive-ok, külső merevlemezek) biztonságos használatát.</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">1. Mobileszközök Védelme</h4>
                        <p class="text-xs leading-relaxed">
                            A szolgálati okostelefonok kaput jelentenek a rendőrségi belső hálózatokhoz. 
                            Mindig védje az eszközt erős PIN kóddal, jelszóval vagy biometrikus azonosítással (ujjlenyomat, arcazonosítás). 
                            <strong>Soha ne hagyja a telefont lezáratlanul az asztalon!</strong>
                        </p>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">2. A Wi-Fi és Bluetooth használat veszélyei</h4>
                        <p class="text-xs leading-relaxed">
                            Külső helyszínen dolgozva szigorúan tilos ingyenes, jelszó nélküli nyilvános Wi-Fi-re csatlakozni szolgálati eszközzel. 
                            Ezeken a hálózatokon az adatok könnyen lehallgathatók. 
                            Ha nincs biztonságos hálózat, használjon jóváhagyott titkosított VPN csatornát. 
                            Használaton kívül kapcsolja ki a Bluetooth és Wi-Fi funkciókat!
                        </p>
                    </div>

                    <div class="space-y-3 bg-cyan-950/20 p-4 border border-cyan-900/30 rounded-xl">
                        <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Arany Szabályok</h4>
                        <ul class="list-decimal pl-5 text-[11px] space-y-1 text-slate-300 font-mono">
                            <li>Ismeretlen forrásból származó USB eszközt soha ne dugjon a szolgálati gépbe!</li>
                            <li>Nyilvános Wi-Fi hálózatot soha ne használjon belső rendőrségi levelezésre!</li>
                            <li>Azonnal jelentse az IBT-nek, ha elvesztette szolgálati telefonját vagy laptopját!</li>
                        </ul>
                    </div>
                </div>
            `,
            quiz: [
                {
                    question: "Szabad-e nyilvános, nyitott Wi-Fi hálózatra csatlakoztatni a szolgálati laptopot VPN nélkül?",
                    answers: [
                        { text: "Igen, mert a VPN feleslegesen lelassítja a munkát.", correct: false },
                        { text: "Szigorúan tilos, mert a nyitott hálózaton az adatok lehallgathatók és az eszköz kompromittálódhat.", correct: true },
                        { text: "Igen, ha bekapcsoltuk a Windows tűzfalat.", correct: false },
                        { text: "Csak akkor, ha csak híroldalakat olvasunk.", correct: false }
                    ]
                },
                {
                    question: "Mit tesz, ha elveszíti a szolgálati okostelefonját?",
                    answers: [
                        { text: "Vásárolok egy újat a saját pénzemből, hogy ne vegyék észre.", correct: false },
                        { text: "Azonnal jelentem a parancsnokomnak és az IBT-nek, hogy távolról letilthassák és törölhessék az eszközt.", correct: true },
                        { text: "Megvárom a hétvégét, hátha valaki megtalálja és visszahozza.", correct: false },
                        { text: "Nem jelentem, mert fegyelmit kapnék érte.", correct: false }
                    ]
                }
            ]
        },
        4: {
            category: "4. TÁRGYALÓ",
            title: "Incidenskezelési Döntési Fa",
            xpAward: 140,
            content: `
                <div class="space-y-6 text-slate-300">
                    <div class="bg-slate-950/50 p-4 border border-cyan-500/20 rounded-xl flex items-center space-x-3">
                        <span class="text-3xl">🚨</span>
                        <div>
                            <h4 class="text-sm font-bold text-white uppercase tracking-wider">A Tananyag Célja</h4>
                            <p class="text-xs text-slate-400">Az információbiztonsági incidensek azonnali elhárítása és a helyes bejelentési protokoll.</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">1. Mi számít Biztonsági Incidensnek?</h4>
                        <p class="text-xs leading-relaxed">
                            Minden olyan nemkívánatos vagy nem várt esemény, amely veszélyezteti az információbiztonságot (CIA pilléreit). 
                            Pl. vírusfertőzés, sikeres adathalászat, zsarolóprogram felugró ablak, jelszó kiszivárgás, szolgálati eszköz elhagyása, idegen kíséret nélküli személy a szerverben.
                        </p>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">2. Az Azonnali Incidenskezelés Lépései (Döntési fa)</h4>
                        <ul class="list-disc pl-5 text-xs space-y-2">
                            <li><strong class="text-cyan-400">1. Lokalizálás és Izoláció (Azonnal!):</strong> Ha a gép vírusos vagy zsarolóprogram fut rajta, az első lépés a hálózatról való azonnali fizikai lecsatlakoztatás (LAN kábel kihúzása, Wi-Fi kikapcsolása). <strong>SOHA ne indítsa újra a gépet, ha zsarolóprogram fut, mert az felgyorsíthatja a titkosítást!</strong></li>
                            <li><strong class="text-cyan-400">2. Jelentés (Késlekedés nélkül):</strong> Jelentse az eseményt az Informatikai Biztonsági Tisztnek (IBT) vagy az ügyeletnek a belső eljárásrend szerint.</li>
                            <li><strong class="text-cyan-400">3. Bizonyítékok megőrzése:</strong> Ne próbálja meg maga letörölni a vírust vagy letölteni tisztító programokat. Hagyja a gépet az IBT utasításai szerinti állapotban.</li>
                        </ul>
                    </div>

                    <div class="space-y-3 bg-cyan-950/20 p-4 border border-cyan-900/30 rounded-xl">
                        <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Arany Szabályok</h4>
                        <ul class="list-decimal pl-5 text-[11px] space-y-1 text-slate-300 font-mono">
                            <li>Azonnali hálózati izoláció: húzza ki a hálózati kábelt!</li>
                            <li>Ne próbálja eltitkolni a hibát, a gyors bejelentés életeket és rendszereket menthet!</li>
                            <li>Soha ne futtasson házilag letöltött vírusirtókat szolgálati gépeken!</li>
                        </ul>
                    </div>
                </div>
            `,
            quiz: [
                {
                    question: "Mi a legelső teendője, ha észleli, hogy a gépe fájljait egy zsarolóprogram elkezdte titkosítani?",
                    answers: [
                        { text: "Kapcsolja ki és be a gépet többször egymás után.", correct: false },
                        { text: "Azonnal húzza ki a hálózati kábelt (LAN) a gépből a fertőzés terjedésének megakadályozására, és hívja az IBT-t.", correct: true },
                        { text: "Gyorsan küldjön körbe egy figyelmeztető e-mailt a kollégáknak a fertőzött gépről.", correct: false },
                        { text: "Töltse le a váltságdíj-fizető programot.", correct: false }
                    ]
                },
                {
                    question: "Szabad-e eltitkolni egy információbiztonsági mulasztást (pl. véletlenül kiadott jelszó), ha nem történt látható baj?",
                    answers: [
                        { text: "Igen, ha senki sem vette észre, felesleges pánikot kelteni.", correct: false },
                        { text: "Nem, minden incidenst vagy gyanút haladéktalanul jelenteni kell, hogy a biztonsági csapat megtehesse a szükséges ellenintézkedéseket.", correct: true },
                        { text: "Csak akkor kell jelenteni, ha a gép lefagy.", correct: false },
                        { text: "Elegendő a közvetlen kollégáknak szólni róla.", correct: false }
                    ]
                }
            ]
        },
        5: {
            category: "5. SZERVERHELYISÉG",
            title: "Kockázatelemzés & Vezetői Döntések",
            xpAward: 150,
            content: `
                <div class="space-y-6 text-slate-300">
                    <div class="bg-slate-950/50 p-4 border border-cyan-500/20 rounded-xl flex items-center space-x-3">
                        <span class="text-3xl">🎛️</span>
                        <div>
                            <h4 class="text-sm font-bold text-white uppercase tracking-wider">A Tananyag Célja</h4>
                            <p class="text-xs text-slate-400">Vezetői szintű kockázatkezelési elvek és a kritikus rendőrségi adatbázisok infrastruktúrájának védelme.</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">1. Kockázatelemzés a Rendőrségen</h4>
                        <p class="text-xs leading-relaxed">
                            A kockázatkezelés célja azonosítani az információs vagyontárgyakat fenyegető veszélyeket, felbecsülni azok bekövetkezési valószínűségét és az okozott kárt (hatást), majd megfelelő védelmi intézkedéseket hozni a kockázatok elfogadható szintre csökkentésére.
                        </p>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">2. A Legkisebb Jogosultság Elve (Principle of Least Privilege)</h4>
                        <p class="text-xs leading-relaxed">
                            Minden felhasználó (akár rendőrjárőr, akár parancsnok) kizárólag azokhoz a rendszerekhez és adatokhoz kaphat hozzáférési jogosultságot, amelyek a napi feladatai elvégzéséhez elengedhetetlenek. Ez megakadályozza az adatokkal való belső visszaéléseket és korlátozza a kárt egy esetleges külső támadás vagy fiókfeltörés során.
                        </p>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-base font-bold text-white">3. Szerver és Infrastruktúra Védelem</h4>
                        <p class="text-xs leading-relaxed">
                            A szerverhelyiség a kapitányság digitális szíve. 
                            Itt futnak a központi adatbázisok és szerverek. 
                            A belépés szigorúan korlátozott, két tényezős fizikai azonosításhoz (pl. kártya + biometria) kötött és kamerával megfigyelt. 
                            Minden belső és külső hálózati forgalmat tűzfalakkal és behatolásjelző rendszerekkel (IDS/IPS) kell monitorozni.
                        </p>
                    </div>

                    <div class="space-y-3 bg-cyan-950/20 p-4 border border-cyan-900/30 rounded-xl">
                        <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Arany Szabályok</h4>
                        <ul class="list-decimal pl-5 text-[11px] space-y-1 text-slate-300 font-mono">
                            <li>Alkalmazza a legkisebb jogosultság elvét jogosultságok kiosztásakor!</li>
                            <li>Gondoskodjon a kritikus adatok rendszeres offline mentéséről és titkosításáról!</li>
                            <li>A szerverhelyiség fizikai védelmét és belépési naplóit rendszeresen auditálja!</li>
                        </ul>
                    </div>
                </div>
            `,
            quiz: [
                {
                    question: "Mit ír le a 'legkisebb jogosultság elve' az információbiztonságban?",
                    answers: [
                        { text: "Hogy az alacsonyabb rendfokozatúaknak semmilyen rendszerhez nem lehet hozzáférésük.", correct: false },
                        { text: "Hogy minden felhasználó csak a feladatai ellátásához feltétlenül szükséges minimális jogosultságokkal rendelkezzen.", correct: true },
                        { text: "Hogy a jelszavak hossza maximum 6 karakter lehet.", correct: false },
                        { text: "Hogy a kapitányságon a legolcsóbb szoftvereket kell vásárolni.", correct: false }
                    ]
                },
                {
                    question: "Miért kiemelten veszélyes, ha egy járőr intézkedés közben készített bizonyíték-képeket vagy személyes adatokat tartalmazó fotókat a saját privát okostelefonján, lakossági csevegőalkalmazáson (pl. Viber, Messenger, WhatsApp) továbbít a kollégáinak?",
                    answers: [
                        { text: "Mert a képek felbontása automatikusan lecsökken a továbbítás során, így a bíróságon nem használhatók fel.", correct: false },
                        { text: "Mert a lakossági csevegők szerverei külföldi magáncégek kezében vannak, így az állami és bűnügyi adatok ellenőrizetlen, kereskedelmi felhőbe kerülnek, ami súlyos adatvédelmi incidens.", correct: true },
                        { text: "Mert ezeknek az alkalmazásoknak az adatforgalmát a bűnözők ingyen le tudják tölteni bármelyik utcai telefonról.", correct: false },
                        { text: "Mert így a parancsnok nem tudja ellenőrizni, hogy a járőr pontosan hány darab fényképet készített a helyszínen.", correct: false }
                    ]
                }
            ]
        }
    }
};

window.Quiz = (function() {
    let activeDiagIndex = 0;
    let diagAnswers = []; // records indices of user answers

    // Diagnostic Test methods
    function startDiagnostic() {
        activeDiagIndex = 0;
        diagAnswers = [];
        const btn = document.getElementById('diag-next-btn');
        if (btn) {
            btn.disabled = true;
            btn.classList.add('cursor-not-allowed', 'bg-slate-800', 'text-slate-400');
            btn.classList.remove('bg-amber-500', 'text-slate-950', 'hover:bg-amber-400');
        }
        renderDiagnosticQuestion();
    }

    function renderDiagnosticQuestion() {
        const qContainer = document.getElementById('diagnostic-question-container');
        const progressText = document.getElementById('diagnostic-progress');
        const progressBar = document.getElementById('diagnostic-progress-bar');
        
        if (!qContainer) return;

        const total = window.QuizData.diagnostic.length;
        const q = window.QuizData.diagnostic[activeDiagIndex];

        // Update progress indicators
        if (progressText) progressText.innerText = `Kérdés: ${activeDiagIndex + 1} / ${total}`;
        if (progressBar) {
            const percent = ((activeDiagIndex) / total) * 100;
            progressBar.style.width = `${percent}%`;
        }

        // Render text
        const qText = document.getElementById('diag-question-text');
        if (qText) qText.innerText = `${activeDiagIndex + 1}. ${q.question}`;

        // Render answers
        const answersDiv = document.getElementById('diag-answers');
        if (answersDiv) {
            answersDiv.innerHTML = '';
            q.answers.forEach((ans, idx) => {
                const btn = document.createElement('button');
                btn.className = 'w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900/80 hover:border-slate-700 text-sm font-medium text-slate-200 transition-all focus:outline-none flex items-center justify-between group';
                btn.onclick = () => selectDiagnosticAnswer(idx, btn);
                btn.innerHTML = `
                    <span>${ans.text}</span>
                    <span class="w-5 h-5 rounded-full border border-slate-700 group-hover:border-cyan-500 flex items-center justify-center text-xs font-bold transition-all" id="diag-opt-circle-${idx}"></span>
                `;
                answersDiv.appendChild(btn);
            });
        }
    }

    function selectDiagnosticAnswer(answerIdx, clickedBtn) {
        diagAnswers[activeDiagIndex] = answerIdx;

        // Visual select indicator
        const totalAnswers = window.QuizData.diagnostic[activeDiagIndex].answers.length;
        for (let i = 0; i < totalAnswers; i++) {
            const circle = document.getElementById(`diag-opt-circle-${i}`);
            const btn = circle ? circle.parentElement : null;
            if (circle && btn) {
                if (i === answerIdx) {
                    circle.className = "w-5 h-5 rounded-full border border-cyan-500 bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400";
                    circle.innerHTML = "✓";
                    btn.className = "w-full text-left p-4 rounded-xl border border-cyan-500/50 bg-cyan-950/30 text-sm font-medium text-slate-100 transition-all focus:outline-none flex items-center justify-between";
                } else {
                    circle.className = "w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-xs font-bold";
                    circle.innerHTML = "";
                    btn.className = "w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900/80 hover:border-slate-700 text-sm font-medium text-slate-200 transition-all focus:outline-none flex items-center justify-between group";
                }
            }
        }

        // Enable next button
        const nextBtn = document.getElementById('diag-next-btn');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.classList.remove('cursor-not-allowed', 'bg-slate-800', 'text-slate-400');
            nextBtn.classList.add('bg-amber-500', 'text-slate-950', 'hover:bg-amber-400');
        }
    }

    function nextDiagnosticQuestion() {
        const total = window.QuizData.diagnostic.length;
        activeDiagIndex++;

        if (activeDiagIndex < total) {
            // Reset next button to disabled for new question
            const nextBtn = document.getElementById('diag-next-btn');
            if (nextBtn) {
                nextBtn.disabled = true;
                nextBtn.classList.add('cursor-not-allowed', 'bg-slate-800', 'text-slate-400');
                nextBtn.classList.remove('bg-amber-500', 'text-slate-950', 'hover:bg-amber-400');
            }
            renderDiagnosticQuestion();
        } else {
            finishDiagnostic();
        }
    }

    function finishDiagnostic() {
        // Calculate Score
        let correctAnswersCount = 0;
        const total = window.QuizData.diagnostic.length;

        window.QuizData.diagnostic.forEach((q, idx) => {
            const userAnsIdx = diagAnswers[idx];
            if (q.answers[userAnsIdx] && q.answers[userAnsIdx].correct) {
                correctAnswersCount++;
            } else {
                // record weakness
                window.Progress.addWeakness(q.question);
            }
        });

        const percentage = Math.round((correctAnswersCount / total) * 100);
        
        // Path recommendation
        let recommendedPath = "Kezdő";
        let recommendedDesc = "Ajánlott az összes modul részletes átolvasása az alapoktól.";
        let initialXP = 50;

        if (percentage >= 85) {
            recommendedPath = "Gyorsított";
            recommendedDesc = "Kiváló elméleti alapok! Koncentráljon a gyakorlati hiba-keresőre és az Escape Room-ra.";
            initialXP = 150;
        } else if (percentage >= 50) {
            recommendedPath = "Haladó";
            recommendedDesc = "Jó alapok. Ajánljuk az adathalászat és incidenskezelés modulok tüzetesebb tanulmányozását.";
            initialXP = 100;
        }

        // Save progress details
        const state = window.Progress.getState();
        state.diagnosticScore = {
            score: correctAnswersCount,
            percentage: percentage,
            path: recommendedPath,
            pathDesc: recommendedDesc
        };
        if (state.user) {
            state.user.path = recommendedPath;
            window.Progress.addXP(initialXP);
        }
        window.Progress.save();

        // Update Diagnostic Result Screen UI
        const scoreEl = document.getElementById('diag-result-score');
        const percentageEl = document.getElementById('diag-result-percentage');
        const pathEl = document.getElementById('diag-result-path');
        const descEl = document.getElementById('diag-result-desc');

        if (scoreEl) scoreEl.innerText = `${correctAnswersCount} / ${total}`;
        if (percentageEl) percentageEl.innerText = `(${percentage}%)`;
        if (pathEl) {
            pathEl.innerText = `${recommendedPath} szint`;
            if (recommendedPath === "Gyorsított") pathEl.className = "text-lg font-bold text-emerald-400 mt-1";
            else if (recommendedPath === "Haladó") pathEl.className = "text-lg font-bold text-cyan-400 mt-1";
            else pathEl.className = "text-lg font-bold text-amber-500 mt-1";
        }
        if (descEl) descEl.innerText = recommendedDesc;

        // Custom notification
        window.Gamification.showToast("Felmérés elkészült", `Kapitánysági besorolás: ${recommendedPath} csoport (+${initialXP} XP)`, 'xp');

        // Transition screen
        window.Navigation.showScreen('screen-diagnostic-result');
    }

    // ==============================================
    // INTERACTIVE OFFICE ERROR FINDER METHODS
    // ==============================================
    function initOfficeErrorFinder() {
        const state = window.Progress.getState();
        const foundErrors = state.officeErrors || [];

        // Set up click triggers on SVG elements
        const triggers = document.querySelectorAll('#office-interactive-svg .error-trigger');
        triggers.forEach(trigger => {
            const errorId = trigger.getAttribute('data-id');
            
            // Check if already found, color accordingly if needed
            if (foundErrors.includes(errorId)) {
                addSuccessIndicator(errorId);
            }

            // Click event
            trigger.onclick = (e) => {
                e.stopPropagation();
                selectOfficeError(errorId);
            };
        });

        updateOfficeCounter();
    }

    function selectOfficeError(errorId) {
        const errorInfo = window.QuizData.officeErrors[errorId];
        if (!errorInfo) return;

        const isNew = window.Progress.addOfficeError(errorId);
        const descBox = document.getElementById('office-error-description');

        if (isNew) {
            addSuccessIndicator(errorId);
            updateOfficeCounter();
            window.Gamification.showToast("Biztonsági rés megtalálva!", `+20 XP: ${errorInfo.title}`, 'xp');
            
            if (descBox) {
                descBox.innerHTML = `
                    <div class="space-y-1">
                        <span class="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1 border border-emerald-500/30">✓ Új Audit Találat</span>
                        <h4 class="text-sm font-bold text-white">${errorInfo.title}</h4>
                        <p class="text-xs text-slate-300 leading-normal">${errorInfo.desc}</p>
                    </div>
                `;
            }
        } else {
            if (descBox) {
                descBox.innerHTML = `
                    <div class="space-y-1">
                        <span class="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">Már auditálva</span>
                        <h4 class="text-sm font-bold text-slate-200">${errorInfo.title}</h4>
                        <p class="text-xs text-slate-400 leading-normal">${errorInfo.desc}</p>
                    </div>
                `;
            }
        }
    }

    function addSuccessIndicator(errorId) {
        const overlayContainer = document.getElementById('office-success-overlays');
        if (!overlayContainer) return;

        // Prevent duplicate overlays
        if (document.getElementById(`success-overlay-${errorId}`)) return;

        // Find the trigger element
        const trigger = document.querySelector(`#office-interactive-svg .error-trigger[data-id="${errorId}"]`);
        if (!trigger) return;

        // Absolute precision center coordinates for placing success highlights over each of the 15 risks
        const coords = {
            'open-window': { cx: 170, cy: 165 },
            'board-pass': { cx: 377, cy: 205 },
            'sensitive-board': { cx: 660, cy: 230 },
            'open-drawer': { cx: 65, cy: 412 },
            'unlocked-pc1': { cx: 330, cy: 300 },
            'monitor-pass': { cx: 368, cy: 321 },
            'unattended-phone': { cx: 402, cy: 423 },
            'abandoned-usb': { cx: 356, cy: 403 },
            'desk-document': { cx: 702, cy: 392 },
            'coffee-hazard': { cx: 544, cy: 416 },
            'exposed-router': { cx: 640, cy: 447 },
            'printer-document': { cx: 885, cy: 291 },
            'cctv-angle': { cx: 254, cy: 44 },
            'unshredded-bin': { cx: 210, cy: 430 },
            'unattended-visitor': { cx: 500, cy: 180 }
        };

        // If no coordinate is defined for this errorId, do not render a center fallback to avoid visual clutter
        if (!coords[errorId]) return;

        const { cx, cy } = coords[errorId];

        // Create elegant, low-opacity glowing highlight ring (no solid circle, and absolutely NO checkmark tick inside the scene)
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `success-overlay-${errorId}`;

        // Soft outer glow pulse
        const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        glow.setAttribute("cx", cx);
        glow.setAttribute("cy", cy);
        glow.setAttribute("r", 15);
        glow.setAttribute("fill", "#10b981");
        glow.setAttribute("fill-opacity", "0.2");
        glow.setAttribute("class", "animate-pulse");

        // Dotted target style ring
        const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ring.setAttribute("cx", cx);
        ring.setAttribute("cy", cy);
        ring.setAttribute("r", 12);
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", "#10b981");
        ring.setAttribute("stroke-width", "1.5");
        ring.setAttribute("stroke-dasharray", "3 2");

        group.appendChild(glow);
        group.appendChild(ring);
        overlayContainer.appendChild(group);
    }

    function updateOfficeCounter() {
        const state = window.Progress.getState();
        const count = state.officeErrors.length;
        const total = 15;

        const counterText = document.getElementById('office-errors-counter');
        const progressBar = document.getElementById('office-errors-bar');

        if (counterText) counterText.innerText = `Megtalált hibák: ${count} / ${total}`;
        if (progressBar) {
            const percent = (count / total) * 100;
            progressBar.style.width = `${percent}%`;
            if (count === total) {
                progressBar.className = "bg-emerald-500 h-full transition-all duration-500";
                window.Gamification.showToast("Tökéletes audit!", "Megtalálta az összes biztonsági hibát az irodában! Elit auditor jelvény szerzve.", 'badge');
            }
        }
    }

    function resetOfficeErrorFinder() {
        const state = window.Progress.getState();
        state.officeErrors = [];
        window.Progress.save();

        // Clear overlays
        const overlayContainer = document.getElementById('office-success-overlays');
        if (overlayContainer) overlayContainer.innerHTML = '';

        updateOfficeCounter();
        const descBox = document.getElementById('office-error-description');
        if (descBox) {
            descBox.innerHTML = `<em>Kattintson az egyik biztonsági hibára az iroda rajzán a vizsgálat elindításához...</em>`;
        }
    }

    // ==============================================
    // ESCAPE ROOM LOGIC (8 RIDDLES)
    // ==============================================
    function initEscapeRoom() {
        renderEscapeRoomLocks();
        renderEscapeRoomRiddle();
    }

    function renderEscapeRoomLocks() {
        const grid = document.getElementById('escaperoom-locks-grid');
        const state = window.Progress.getState();
        const progressText = document.getElementById('escaperoom-progress');
        
        if (!grid) return;
        grid.innerHTML = '';

        let unlockedCount = 0;

        for (let i = 0; i < 8; i++) {
            const isUnlocked = state.escaperoomLocks[i];
            if (isUnlocked) unlockedCount++;

            const lockDiv = document.createElement('div');
            lockDiv.className = `flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-300 ${isUnlocked ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`;
            
            let icon = '';
            if (isUnlocked) {
                // Open lock SVG
                icon = `<svg class="w-6 h-6 mb-1 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>`;
            } else {
                // Closed lock SVG
                icon = `<svg class="w-6 h-6 mb-1 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`;
            }

            lockDiv.innerHTML = `
                ${icon}
                <span class="text-[9px] font-mono font-bold uppercase">${i + 1}. Zár</span>
                <span class="text-[8px] font-mono uppercase">${isUnlocked ? 'Nyitva' : 'Zárva'}</span>
            `;
            grid.appendChild(lockDiv);
        }

        if (progressText) progressText.innerText = `Zárak feltörve: ${unlockedCount} / 8`;
    }

    function renderEscapeRoomRiddle() {
        const area = document.getElementById('escaperoom-active-area');
        const state = window.Progress.getState();
        if (!area) return;

        // Check if all 8 locks are open
        const allUnlocked = state.escaperoomLocks.every(l => l === true);
        if (allUnlocked) {
            area.className = "bg-emerald-950/30 border border-emerald-500/30 p-8 rounded-xl text-center space-y-4";
            area.innerHTML = `
                <div class="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 animate-pulse">
                    <svg class="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h3 class="text-2xl font-extrabold text-white">Sikeres Szabadulás!</h3>
                <p class="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Sikeresen feloldotta a kapitányság mind a 8 elektronikus biztonsági zárját. Bizonyította elméleti és gyakorlati felkészültségét ezen a szigorított teszten!
                </p>
                <div class="pt-4">
                    <button onclick="window.Navigation.showScreen('screen-map')" class="px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition-all">Vissza a Főhadiszállásra</button>
                </div>
            `;
            return;
        }

        // Find the first locked riddle
        const activeIdx = state.escaperoomLocks.indexOf(false);
        const riddle = window.QuizData.escaperoom[activeIdx];

        area.innerHTML = `
            <div>
                <span class="text-[10px] font-bold text-red-500 uppercase tracking-widest font-mono">Aktív Rejtvény</span>
                <h4 class="text-lg font-bold text-white mt-1">${riddle.title}</h4>
                <p class="text-xs text-slate-300 mt-3 bg-slate-950/60 p-4 border border-slate-850 rounded-xl leading-relaxed">${riddle.riddle}</p>
            </div>

            <div class="grid grid-cols-1 gap-3 pt-3">
                ${riddle.answers.map((ans, idx) => `
                    <button onclick="Quiz.selectEscapeRoomAnswer(${idx})" class="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center justify-between group">
                        <span>${ans.text}</span>
                        <span class="w-5 h-5 rounded-full border border-slate-700 group-hover:border-red-500/50 flex items-center justify-center text-[10px] text-slate-400">➜</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    function selectEscapeRoomAnswer(ansIdx) {
        const state = window.Progress.getState();
        const activeIdx = state.escaperoomLocks.indexOf(false);
        const riddle = window.QuizData.escaperoom[activeIdx];
        const ans = riddle.answers[ansIdx];

        if (ans.correct) {
            window.Progress.setEscaperoomLock(activeIdx, true);
            window.Gamification.showToast("Helyes válasz! Zár feloldva.", `+50 XP: ${riddle.title}`, 'success');
            initEscapeRoom(); // rerender
        } else {
            window.Gamification.showToast("Hibás eljárásmód!", "Sajnos ez nem a helyes protokoll. Próbálja újra!", 'warning');
            // Flash active container in red briefly
            const area = document.getElementById('escaperoom-active-area');
            if (area) {
                area.classList.add('border-red-500/50', 'bg-red-950/10');
                setTimeout(() => {
                    area.classList.remove('border-red-500/50', 'bg-red-950/10');
                }, 800);
            }
        }
    }

    return {
        startDiagnostic: startDiagnostic,
        nextDiagnosticQuestion: nextDiagnosticQuestion,
        selectOfficeError: selectOfficeError,
        initOfficeErrorFinder: initOfficeErrorFinder,
        resetOfficeErrorFinder: resetOfficeErrorFinder,
        initEscapeRoom: initEscapeRoom,
        selectEscapeRoomAnswer: selectEscapeRoomAnswer,
        renderEscapeRoomRiddle: renderEscapeRoomRiddle
    };
})();
