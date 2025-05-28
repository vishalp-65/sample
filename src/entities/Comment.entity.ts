import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm"
import { User } from "./User.entity"

@Entity("comments")
@Index(["authorId"])
@Index(["createdAt"])
export class Comment {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: "text" })
    content: string

    @Column({ type: "uuid" })
    authorId: string

    @Column({ type: "boolean", default: true })
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "authorId" })
    author: User

    toJSON() {
        return {
            id: this.id,
            content: this.content,
            authorId: this.authorId,
            author: this.author
                ? {
                      id: this.author.id,
                      name: this.author.name,
                      email: this.author.email
                  }
                : null,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}
