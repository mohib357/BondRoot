package com.svnstartech.bondroot.ui.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.svnstartech.bondroot.R;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.repository.PersonRepository;

import java.util.List;

public class PersonAdapter extends RecyclerView.Adapter<PersonAdapter.ViewHolder> {

    public interface OnPersonClickListener {
        void onPersonClick(Person person);
    }

    private final List<Person> personList;
    private final PersonRepository repository;
    private final OnPersonClickListener listener;

    public PersonAdapter(List<Person> list, PersonRepository repository, OnPersonClickListener listener) {
        this.personList = list;
        this.repository = repository;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_person, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Person p = personList.get(position);
        boolean isEnglish = com.svnstartech.bondroot.util.LanguageManager.isEnglish(holder.itemView.getContext());
        holder.tvName.setText(p.getDisplayName(isEnglish));

        String dob = p.getDateOfBirth() != null ? p.getDateOfBirth() : (isEnglish ? "Unknown" : "অজানা");
        String livingStatus = p.isLiving() ? (isEnglish ? "Alive" : "জীবিত") : (isEnglish ? "Deceased" : "প্রয়াত");
        String birthLabel = isEnglish ? "Birth" : "জন্ম";
        holder.tvDetails.setText("ID: " + p.getPersonId() + " • " + birthLabel + ": " + dob + " • " + livingStatus);

        String fatherName = isEnglish ? "Root Ancestor / None" : "মূল পূর্বপুরুষ (Root)";
        if (p.getFatherId() != null) {
            Person father = repository.getPersonById(p.getFatherId());
            if (father != null) {
                fatherName = father.getDisplayName(isEnglish);
            } else {
                fatherName = p.getFatherId();
            }
        }
        String fatherLabel = isEnglish ? "Father" : "পিতা";
        holder.tvFatherMother.setText(fatherLabel + ": " + fatherName);

        String initial = "B";
        String name = isEnglish ? p.getNameEnglish() : p.getNameLocal();
        if (name == null || name.isEmpty()) name = p.getNameLocal();
        if (name != null && !name.isEmpty()) {
            initial = name.substring(0, 1).toUpperCase();
        }
        holder.tvAvatar.setText(initial);
        holder.tvActionView.setText(isEnglish ? "Details" : "বিস্তারিত");

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onPersonClick(p);
        });
    }

    @Override
    public int getItemCount() {
        return personList.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvAvatar, tvName, tvDetails, tvFatherMother, tvActionView;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvAvatar = itemView.findViewById(R.id.tvAvatar);
            tvName = itemView.findViewById(R.id.tvName);
            tvDetails = itemView.findViewById(R.id.tvDetails);
            tvFatherMother = itemView.findViewById(R.id.tvFatherMother);
            tvActionView = itemView.findViewById(R.id.tvActionView);
        }
    }
}
