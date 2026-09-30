/**
 * ============================================
 *  FIB Winslow 14 — Файл доступа (ACCESS FILE)
 * ============================================
 * 
 *  УРОВНИ ДОСТУПА:
 *  1. agent    — Обычный фибовец
 *  2. curator  — Куратор отдела
 *  3. deputy   — Заместитель директора
 *  4. leader   — Лидер / Директор
 *
 *  Чтобы добавить нового сотрудника:
 *  скопируй блок и заполни поля.
 *
 *  department — для кураторов (id / inv / ciu / training / null)
 */

const ACCESS_USERS = [
    // ——— ЛИДЕР ———
    {
        login: "leader",
        password: "fib2026leader",
        name: "Director_Winslow",
        role: "leader",
        department: null
    },

    // ——— ЗАМ. ДИРЕКТОРА ———
    {
        login: "deputy",
        password: "fib2026deputy",
        name: "Deputy_Chief",
        role: "deputy",
        department: null
    },

    // ——— КУРАТОРЫ ОТДЕЛОВ ———
    {
        login: "curator_id",
        password: "fib_id_2026",
        name: "Curator_ID",
        role: "curator",
        department: "id"
    },
    {
        login: "curator_inv",
        password: "fib_inv_2026",
        name: "Curator_INV",
        role: "curator",
        department: "inv"
    },
    {
        login: "curator_ciu",
        password: "fib_ciu_2026",
        name: "Curator_CIU",
        role: "curator",
        department: "ciu"
    },
    {
        login: "curator_train",
        password: "fib_train_2026",
        name: "Curator_Training",
        role: "curator",
        department: "training"
    },

    // ——— ОБЫЧНЫЕ ФИБОВЦЫ ———
    {
        login: "agent1",
        password: "agent123",
        name: "Agent_Smith",
        role: "agent",
        department: null
    },
    {
        login: "agent2",
        password: "agent456",
        name: "Agent_Miller",
        role: "agent",
        department: null
    }
];

// Названия ролей для отображения
const ROLE_LABELS = {
    agent: "Фибовец",
    curator: "Куратор отдела",
    deputy: "Зам. директора",
    leader: "Лидер"
};

// Права доступа по ролям
const PERMISSIONS = {
    agent: {
        view: ["news", "recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "dept-id", "dept-inv", "dept-ciu", "dept-training"],
        add: ["recommendations", "recruitments", "questionnaires"],
        edit: [],
        delete: [],
        manageUsers: false,
        manageNews: false
    },
    curator: {
        view: ["news", "recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "dept-id", "dept-inv", "dept-ciu", "dept-training"],
        add: ["recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id"],
        edit: ["recommendations", "recruitments", "registry", "questionnaires"],
        delete: [],
        manageUsers: false,
        manageNews: false
    },
    deputy: {
        view: ["news", "recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "dept-id", "dept-inv", "dept-ciu", "dept-training"],
        add: ["recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "news"],
        edit: ["recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "news"],
        delete: ["recommendations", "recruitments", "registry", "questionnaires"],
        manageUsers: false,
        manageNews: true
    },
    leader: {
        view: ["news", "recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "dept-id", "dept-inv", "dept-ciu", "dept-training"],
        add: ["recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "news"],
        edit: ["recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "news"],
        delete: ["recommendations", "recruitments", "registry", "questionnaires", "bl-recruitments", "bl-id", "news"],
        manageUsers: true,
        manageNews: true
    }
};

// Отделы (можно дополнять)
const DEPARTMENTS = {
    id: { name: "Internal Division (ID)", icon: "🔍" },
    inv: { name: "Следственный отдел", icon: "📂" },
    ciu: { name: "CIU", icon: "🕵️" },
    training: { name: "Отдел обучения", icon: "🎓" }
};
