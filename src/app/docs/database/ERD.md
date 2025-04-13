

# 【受託開発アサイン課題 ①】DB設計とDBの接続

## ERD図作成

```mermaid
erDiagram
    User {
        string id PK "ユーザーID"
        string name "名前"
        string email "メールアドレス"
        enum role "ユーザーロール（ADMIN / USER）"
    }

    Project {
        string id PK "案件ID"
        string title "案件名"
        string description "概要"
        int price "単価"
        date deadline "応募締切日"
        date created_at "案件作成日"
        string creator_id FK "作成者（ユーザーID）"
    }

        Skill {
        string id PK "スキルID"
        string name "スキル名"
    }

    ProjectSkill {
        string project_id FK "案件ID"
        string skill_id FK "スキルID"
    }

    Entry {
        string project_id FK "案件ID"
        string user_id FK "ユーザーID"
        enum status "エントリーステータス（PENDING / APPROVED / REJECTED / WITHDRAWN）"
        date entry_date "エントリー日"
    }

    User ||--o{ Project : "作成"
    User ||--o{ Entry : "エントリー"
    Project ||--o{ Entry : "応募"
    Project ||--o{ ProjectSkill : "必要スキル"
    Skill ||--o{ ProjectSkill : "関連スキル"
