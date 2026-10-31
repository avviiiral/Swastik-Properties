export interface BlogPost {
 id:number;title:string;slug:string;excerpt:string;content?:string;cover_image?:string|null;category:string;tags:string[];status:'DRAFT'|'PUBLISHED'|'ARCHIVED';published_at:string|null;author:{id:number;username:string;first_name:string;last_name:string}|null;seo_title:string;seo_description:string;reading_time:number;created_at:string;updated_at:string;
}
export interface PaginatedBlogPosts {count:number;next:string|null;previous:string|null;results:BlogPost[];}
